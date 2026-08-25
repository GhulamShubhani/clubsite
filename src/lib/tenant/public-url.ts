import { getRootDomain } from "@/lib/tenant/root-domain";

/** Short website name chosen at signup (e.g. "test1" → …/club/test1). */
export function getClubSlugLabel(slug: string): string {
  return slug;
}

export function getClubPathUrl(slug: string, pagePath = "/"): string {
  const root = getRootDomain();
  const protocol = root.includes("localhost") ? "http" : "https";
  const base = `${protocol}://${root}/club/${encodeURIComponent(slug)}`;
  if (!pagePath || pagePath === "/") return base;
  const suffix = pagePath.startsWith("/") ? pagePath.slice(1) : pagePath;
  return `${base}/${suffix}`;
}

/** Subdomain URL — works when wildcard DNS is configured (may not work on Vercel by default). */
export function getClubSubdomainUrl(slug: string): string {
  const root = getRootDomain();
  const protocol = root.includes("localhost") ? "http" : "https";
  return `${protocol}://${slug}.${root}`;
}

/** Primary public URL — path-based works on Vercel without extra DNS setup. */
export function getClubPublicUrl(slug: string, pagePath = "/"): string {
  return getClubPathUrl(slug, pagePath);
}

export const SLUG_HELP =
  "Your website short name is the simple address you picked when you signed up (for example: test1). It appears in your website link so people can find your club.";
