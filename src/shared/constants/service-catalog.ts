import { ServiceStatus } from "./enums";

export type ServiceCode = string;

export type ServiceCatalogItem = {
  name: string;
  code: ServiceCode;
};

export const DEFAULT_SERVICE_CATALOG: ServiceCatalogItem[] = [
  { name: "Konsultasi Statistik", code: "K" },
  { name: "Perpustakaan", code: "P" },
  { name: "Rekomendasi Statistik", code: "R" },
  { name: "Pelayanan DTSEN", code: "D" },
];

export const DEFAULT_SERVICE_CODE: ServiceCode = "K";

const normalizeServiceName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

export const normalizeServiceCode = (value: string): ServiceCode =>
  value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, "");

const SERVICE_CODE_BY_NAME = new Map<string, ServiceCode>(
  DEFAULT_SERVICE_CATALOG.map((service) => [normalizeServiceName(service.name), service.code])
);

export const isServiceActive = <T extends { status: ServiceStatus }>(service: T): boolean =>
  service.status === ServiceStatus.ACTIVE;

export const filterActiveServices = <T extends { status: ServiceStatus }>(services: T[]): T[] =>
  services.filter(isServiceActive);

export const getServiceCodeByName = (serviceName: string | null | undefined): ServiceCode => {
  if (!serviceName?.trim()) {
    return DEFAULT_SERVICE_CODE;
  }

  const exactMatch = SERVICE_CODE_BY_NAME.get(normalizeServiceName(serviceName));
  if (exactMatch) {
    return exactMatch;
  }

  const firstLetter = serviceName.trim().charAt(0).toUpperCase();
  if (firstLetter === "P") {
    return "P";
  }
  if (firstLetter === "R") {
    return "R";
  }

  return DEFAULT_SERVICE_CODE;
};

export const generateUniqueServiceCode = (
  serviceName: string,
  existingCodes: string[]
): ServiceCode => {
  const normalizedCodes = new Set(
    existingCodes
      .map((code) => normalizeServiceCode(code))
      .filter((code) => code.length > 0)
  );

  const preferredCode = getServiceCodeByName(serviceName);
  if (preferredCode && !normalizedCodes.has(preferredCode)) {
    return preferredCode;
  }

  const normalizedName = serviceName.trim().toUpperCase();
  const baseCode = normalizeServiceCode(normalizedName.charAt(0)) || "S";

  if (!normalizedCodes.has(baseCode)) {
    return baseCode;
  }

  for (let i = 2; i <= 9999; i += 1) {
    const candidate = `${baseCode}${i}`;
    if (!normalizedCodes.has(candidate)) {
      return candidate;
    }
  }

  return `${baseCode}${Date.now()}`;
};