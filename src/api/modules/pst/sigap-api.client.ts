type SigapCredentials = {
  username: string;
  password: string;
};

type SigapLoginResponse = {
  token: string | null;
  cookieHeader: string | null;
  authMode: "bearer" | "cookie";
  raw: unknown;
};

const REQUEST_TIMEOUT_MS = 12000;

type RequestJsonInit = RequestInit & {
  timeoutMs?: number;
};

const withTimeout = async (input: string, init: RequestJsonInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init.timeoutMs ?? REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
};

const normalizeToken = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^Bearer\s+/i.test(trimmed)) {
    const bearerValue = trimmed.replace(/^Bearer\s+/i, "").trim();
    return bearerValue.length > 0 ? bearerValue : null;
  }

  return trimmed;
};

const readByPath = (value: unknown, path: string): unknown => {
  if (!path.trim()) {
    return undefined;
  }

  const segments = path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

  let cursor: unknown = value;
  for (const segment of segments) {
    const record = asRecord(cursor);
    if (!record || !(segment in record)) {
      return undefined;
    }
    cursor = record[segment];
  }

  return cursor;
};

const TOKEN_FIELD_CANDIDATES = [
  "token",
  "access_token",
  "accessToken",
  "id_token",
  "idToken",
  "jwt",
  "bearer",
  "authorization",
] as const;

const extractToken = (value: unknown): string | null => {
  const customPath = process.env.SIGAP_TOKEN_RESPONSE_PATH?.trim();
  if (customPath) {
    const customValue = readByPath(value, customPath);
    if (typeof customValue === "string") {
      const normalized = normalizeToken(customValue);
      if (normalized) {
        return normalized;
      }
    }
  }

  if (typeof value === "string") {
    return normalizeToken(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = extractToken(item);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  for (const key of TOKEN_FIELD_CANDIDATES) {
    const candidate = record[key];
    if (typeof candidate === "string") {
      const normalized = normalizeToken(candidate);
      if (normalized) {
        return normalized;
      }
    }
  }

  for (const entryValue of Object.values(record)) {
    const nested = extractToken(entryValue);
    if (nested) {
      return nested;
    }
  }

  return null;
};

const extractContactsPayload = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  if (!record) {
    return [];
  }

  const candidates = [record.contacts, record.data, record.items, record.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    const nested = asRecord(candidate);
    if (nested?.contacts && Array.isArray(nested.contacts)) {
      return nested.contacts;
    }
  }

  return [];
};

const looksLikeHtml = (value: unknown) =>
  typeof value === "string" && /<\s*html|<!doctype html/i.test(value);

const readErrorMessage = (payload: unknown, fallback: string) => {
  const record = asRecord(payload);
  const message = record?.message ?? record?.error;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  return fallback;
};

const toCookieHeaderFromSetCookie = (setCookieValues: string[]): string | null => {
  const cookiePairs = setCookieValues
    .map((setCookie) => setCookie.split(";")[0]?.trim())
    .filter((cookie): cookie is string => Boolean(cookie));

  if (cookiePairs.length === 0) {
    return null;
  }

  return cookiePairs.join("; ");
};

const extractCookieHeader = (response: Response): string | null => {
  const headerBag = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headerBag.getSetCookie === "function") {
    const setCookieValues = headerBag.getSetCookie();
    if (Array.isArray(setCookieValues) && setCookieValues.length > 0) {
      return toCookieHeaderFromSetCookie(setCookieValues);
    }
  }

  const fallbackSetCookie = response.headers.get("set-cookie");
  if (!fallbackSetCookie) {
    return null;
  }

  // Best effort split for multiple cookies where commas separate cookie segments.
  const setCookieValues = fallbackSetCookie
    .split(/,(?=\s*[A-Za-z0-9_\-]+=)/g)
    .map((value) => value.trim())
    .filter(Boolean);

  return toCookieHeaderFromSetCookie(setCookieValues);
};

export class SigapApiClient {
  private readonly baseUrl: string;
  private readonly loginPath: string;
  private readonly contactsPath: string;
  private readonly holidaysPath: string;

  constructor() {
    this.baseUrl = process.env.SIGAP_BASE_URL?.trim() || "https://sigap.databenuanta.id";
    this.loginPath = process.env.SIGAP_LOGIN_PATH?.trim() || "/api/auth/login";
    this.contactsPath = process.env.SIGAP_CONTACTS_PATH?.trim() || "/api/admin/contacts";
    this.holidaysPath = process.env.SIGAP_HOLIDAYS_PATH?.trim() || "/api/admin/calendar";
  }

  private buildUrl(path: string) {
    const normalizedBase = this.baseUrl.endsWith("/") ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  private async requestJson(url: string, init: RequestJsonInit = {}) {
    const response = await withTimeout(url, init);
    const contentType = response.headers.get("content-type") || "";

    let payload: unknown = null;
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      payload = text || null;
    }

    if (!response.ok) {
      throw new Error(readErrorMessage(payload, `SIGAP request gagal (${response.status})`));
    }

    return payload;
  }

  async login(credentials: SigapCredentials): Promise<SigapLoginResponse> {
    const loginUrl = this.buildUrl(this.loginPath);
    const response = await withTimeout(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const contentType = response.headers.get("content-type") || "";
    let payload: unknown = null;
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => "");
      payload = text || null;
    }

    if (!response.ok) {
      throw new Error(readErrorMessage(payload, `SIGAP request gagal (${response.status})`));
    }

    const token = extractToken(payload);
    const cookieHeader = extractCookieHeader(response);
    if (!token && !cookieHeader) {
      const topLevelKeys = Object.keys(asRecord(payload) ?? {}).slice(0, 8).join(", ");
      throw new Error(
        `Login SIGAP berhasil tetapi token tidak ditemukan pada response${
          topLevelKeys ? ` (keys: ${topLevelKeys})` : ""
        }. Jika SIGAP memakai token pada field khusus, set SIGAP_TOKEN_RESPONSE_PATH (contoh: data.access_token).`
      );
    }

    return {
      token,
      cookieHeader,
      authMode: token ? "bearer" : "cookie",
      raw: payload,
    };
  }

  async fetchContacts(auth: SigapLoginResponse): Promise<unknown[]> {
    const headers: Record<string, string> = {};
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    if (auth.cookieHeader) {
      headers.Cookie = auth.cookieHeader;
    }

    const payload = await this.requestJson(this.buildUrl(this.contactsPath), {
      method: "GET",
      headers,
    });

    return extractContactsPayload(payload);
  }

  async fetchHolidays(auth: SigapLoginResponse): Promise<unknown> {
    const headers: Record<string, string> = {};
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
    if (auth.cookieHeader) {
      headers.Cookie = auth.cookieHeader;
    }
    const candidates = Array.from(
      new Set([this.holidaysPath, "/api/admin/calendar", "/api/admin/holidays", "/admin/holidays"])
    );

    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        const payload = await this.requestJson(this.buildUrl(path), {
          method: "GET",
          headers,
        });

        if (looksLikeHtml(payload)) {
          continue;
        }

        return payload;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError instanceof Error) {
      throw lastError;
    }

    throw new Error(
      "Gagal mengambil kalender hari libur/cuti dari SIGAP. Periksa SIGAP_HOLIDAYS_PATH."
    );
  }
}

export type { SigapCredentials, SigapLoginResponse };
