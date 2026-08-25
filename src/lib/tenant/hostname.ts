/**
 * Resolve club identity from the request hostname — never from a tenant ID in the URL.
 *
 * Local:  abc-gaming.localhost:3000
 * Prod:   abc-gaming.yourplatform.com
 * Apex:   localhost:3000 / yourplatform.com  → platform (no tenant)
 * Custom: club.example.com → potential custom domain (resolved via Domain table)
 */

import { getRootDomain, isPlatformHost, stripPort } from "@/lib/tenant/root-domain";

export type HostnameResolution =
  | { kind: "platform" }
  | { kind: "tenant"; slug: string; hostname: string };

function isPlatformApex(host: string, root: string): boolean {
  return host === root || host === "www." + root;
}

/**
 * Extract the tenant slug from a platform subdomain.
 * Returns null when the host is the platform apex or a non-platform hostname
 * (e.g. custom domain).
 */
export function extractSlugFromHostname(
  hostname: string,
  rootDomain: string,
): string | null {
  const host = stripPort(hostname);
  const root = stripPort(rootDomain);

  if (isPlatformApex(host, root)) {
    return null;
  }

  // "*.localhost" special-case: browsers treat "slug.localhost" as a valid host
  if (root === "localhost" || root.startsWith("localhost")) {
    const match = host.match(/^([a-z0-9-]+)\.localhost$/);
    if (match) return match[1];
    return null;
  }

  if (!host.endsWith("." + root)) {
    return null;
  }

  const subdomain = host.slice(0, -(root.length + 1));
  // Reject nested multi-level subdomains for MVP (e.g. a.b.platform.com)
  if (!subdomain || subdomain.includes(".")) {
    return null;
  }

  return subdomain;
}

/**
 * Classify a hostname as platform apex, platform subdomain tenant, or
 * potential custom-domain tenant.
 */
export function resolveHostnameKind(
  hostname: string,
  rootDomain = getRootDomain(),
): HostnameResolution {
  const host = stripPort(hostname);

  if (isPlatformHost(hostname, rootDomain)) {
    return { kind: "platform" };
  }

  const slug = extractSlugFromHostname(hostname, rootDomain);
  if (slug) {
    return {
      kind: "tenant",
      slug,
      hostname: host,
    };
  }

  // Not apex and not `{slug}.{root}` → treat as custom domain candidate
  return {
    kind: "tenant",
    slug: "custom",
    hostname: host,
  };
}

/** Header names used to pass resolved tenant context from middleware → server components. */
export const TENANT_HEADERS = {
  slug: "x-tenant-slug",
  hostname: "x-tenant-hostname",
  kind: "x-host-kind",
} as const;
