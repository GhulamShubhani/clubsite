import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  resolveHostnameKind,
  type HostnameResolution,
} from "@/lib/tenant/hostname";

export type ResolvedTenant = {
  id: string;
  name: string;
  slug: string;
  hostname: string;
};

/**
 * Look up the tenant from the request Host header via the Domain table.
 * Tenant IDs are never taken from the browser path or query string.
 *
 * Custom domains (isCustom=true) are only resolved when verifiedAt is set.
 * Platform subdomains (isCustom=false) resolve even without verification.
 */
export async function resolveTenantFromHost(
  hostHeader: string | null,
): Promise<
  | { kind: "platform" }
  | { kind: "tenant"; tenant: ResolvedTenant }
  | { kind: "unknown_tenant"; resolution: HostnameResolution }
> {
  if (!hostHeader) {
    return { kind: "platform" };
  }

  const resolution = resolveHostnameKind(hostHeader);

  if (resolution.kind === "platform") {
    return { kind: "platform" };
  }

  const hostname = hostHeader.toLowerCase();

  // Prefer exact hostname match (platform subdomain or verified custom domain).
  const byHostname = await prisma.domain.findUnique({
    where: { hostname },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
    },
  });

  if (byHostname) {
    if (byHostname.isCustom && !byHostname.verifiedAt) {
      return { kind: "unknown_tenant", resolution };
    }
    return {
      kind: "tenant",
      tenant: {
        id: byHostname.tenant.id,
        name: byHostname.tenant.name,
        slug: byHostname.tenant.slug,
        hostname: byHostname.hostname,
      },
    };
  }

  // Fallback: slug from platform subdomain → tenant (not for custom hosts)
  if (resolution.slug === "custom") {
    return { kind: "unknown_tenant", resolution };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: resolution.slug },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    return { kind: "unknown_tenant", resolution };
  }

  return {
    kind: "tenant",
    tenant: {
      ...tenant,
      hostname,
    },
  };
}

export async function requireTenantFromHost(hostHeader: string | null) {
  const result = await resolveTenantFromHost(hostHeader);
  if (result.kind !== "tenant") {
    throw new NotFoundError("Club website not found");
  }
  return result.tenant;
}
