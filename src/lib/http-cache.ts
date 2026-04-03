export function toEtag(marker: string) {
  return `"${marker}"`;
}

const normalizeEtag = (value: string) => value.trim().replace(/^W\//, "");

export function extractEtagMarker(ifNoneMatch: string | null) {
  if (!ifNoneMatch) {
    return null;
  }

  const [firstMatch] = ifNoneMatch
    .split(",")
    .map((value) => normalizeEtag(value).replace(/^"|"$/g, ""))
    .filter(Boolean);

  return firstMatch ?? null;
}

export function matchesEtag(ifNoneMatch: string | null, etag: string) {
  if (!ifNoneMatch) {
    return false;
  }

  const normalizedTarget = normalizeEtag(etag);
  return ifNoneMatch.split(",").map(normalizeEtag).includes(normalizedTarget);
}
