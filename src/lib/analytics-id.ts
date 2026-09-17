/** GA4 (G-), Universal Analytics (UA-), Google tag (GT-), or GTM container. */
const GA_ID_RE =
  /^(G-[A-Z0-9]{6,}|UA-\d{4,}-\d+|GT-[A-Z0-9]+|GTM-[A-Z0-9]+)$/i;

export function normalizeAnalyticsId(value: string | null | undefined) {
  return (value ?? "").trim();
}

export function isValidGoogleAnalyticsId(value: string | null | undefined) {
  const id = normalizeAnalyticsId(value);
  if (!id) return true;
  return GA_ID_RE.test(id);
}

export function analyticsIdError(value: string | null | undefined) {
  const id = normalizeAnalyticsId(value);
  if (!id) return null;
  if (GA_ID_RE.test(id)) return null;
  return "Use a valid ID such as G-XXXXXXXXXX, UA-XXXXXXX-X, or GTM-XXXXXXX.";
}

export function analyticsIdFromTokens(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const id = (raw as Record<string, unknown>).googleAnalyticsId;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}
