/** True when a URL should leave the club site (full page load). */
export function isExternalHref(href: string): boolean {
  return (
    /^(https?:|mailto:|tel:)/i.test(href) ||
    href.startsWith("//")
  );
}

/**
 * Turn a page path like `/team` into a public site path.
 * Path-based clubs live under `/club/{slug}`; subdomain clubs use `/team` as-is.
 */
export function resolveSiteHref(href: string, basePath = ""): string {
  const raw = href.trim() || "#";
  if (raw === "#" || raw.startsWith("#") || isExternalHref(raw)) {
    return raw;
  }
  if (!basePath) {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path === "/") return basePath;
  return `${basePath}${path}`;
}
