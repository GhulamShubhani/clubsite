import { prisma } from "@/lib/db";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
  type TenantContext,
} from "@/lib/tenant/access";
import { NotFoundError } from "@/lib/errors";

/**
 * Tenant-scoped data access for pages & media.
 * Every query is bound to the authenticated tenant — Club A cannot read Club B.
 */
export async function listPagesForTenant(ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "VIEWER" }));
  return prisma.page.findMany({
    where: tenantScope(access),
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      path: true,
      status: true,
      sortOrder: true,
      updatedAt: true,
    },
  });
}

export async function getPageForTenant(pageId: string, ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "VIEWER" }));
  const page = await prisma.page.findFirst({
    where: { id: pageId, ...tenantScope(access) },
    include: {
      versions: {
        where: { kind: { in: ["DRAFT", "PUBLISHED"] } },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!page) {
    throw new NotFoundError("Page not found");
  }
  assertSameTenant(access, page.tenantId, "Page");
  return page;
}

export async function listMediaForTenant(ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "VIEWER" }));
  return prisma.media.findMany({
    where: tenantScope(access),
    orderBy: { createdAt: "desc" },
  });
}

export async function getMediaForTenant(mediaId: string, ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "VIEWER" }));
  const media = await prisma.media.findFirst({
    where: { id: mediaId, ...tenantScope(access) },
  });
  if (!media) {
    throw new NotFoundError("Media not found");
  }
  assertSameTenant(access, media.tenantId, "Media");
  return media;
}

export async function deleteMediaForTenant(
  mediaId: string,
  ctx?: TenantContext,
) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "EDITOR" }));
  // deleteMany with tenant scope: zero rows if wrong tenant (no cross-tenant delete).
  const result = await prisma.media.deleteMany({
    where: { id: mediaId, ...tenantScope(access) },
  });
  if (result.count === 0) {
    throw new NotFoundError("Media not found");
  }
  return { ok: true as const };
}
