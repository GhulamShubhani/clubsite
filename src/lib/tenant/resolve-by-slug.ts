import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import type { ResolvedTenant } from "@/lib/tenant/resolve";

/** Resolve a club by its signup slug (path-based URLs like /club/my-club). */
export async function resolveTenantFromSlug(
  slug: string,
): Promise<ResolvedTenant> {
  const normalized = slug.trim().toLowerCase();
  const tenant = await prisma.tenant.findUnique({
    where: { slug: normalized },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    throw new NotFoundError("Club website not found");
  }

  return {
    ...tenant,
    hostname: normalized,
  };
}
