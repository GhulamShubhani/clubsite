/** Rewrite internal site paths for template preview mode. */
export function previewPathFor(templateKey: string, href: string): string | null {
  if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) {
    return null;
  }
  const path = href.startsWith("/") ? href : `/${href}`;
  const base = `/admin/templates/preview/${templateKey}`;
  return path === "/" ? base : `${base}?path=${encodeURIComponent(path)}`;
}

export function isInternalSitePath(href: string): boolean {
  return Boolean(href && href.startsWith("/") && !href.startsWith("//"));
}
