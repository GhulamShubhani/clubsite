import { z } from "zod";
import { PageStatus } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { AppError, NotFoundError } from "@/lib/errors";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
} from "@/lib/tenant/access";
import { getPageForTenant } from "@/lib/tenant/data";

type Params = { params: Promise<{ pageId: string }> };

const patchPageSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    path: z
      .string()
      .min(1)
      .max(200)
      .transform((p) => (p.startsWith("/") ? p : `/${p}`))
      .optional(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
    status: z.nativeEnum(PageStatus).optional(),
    seoTitle: z.string().max(200).nullable().optional(),
    seoDescription: z.string().max(500).nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field is required",
  });

/**
 * Fetch a single page. Lookup is always scoped to the caller's tenant.
 * Supplying another club's pageId returns 404 (no cross-tenant leak).
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { pageId } = await params;
    const page = await getPageForTenant(pageId);
    return jsonOk({ page });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Rename / reorder / path / status / SEO. Always tenant-scoped. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { pageId } = await params;
    const body = patchPageSchema.parse(await request.json());

    const page = await prisma.page.findFirst({
      where: { id: pageId, ...tenantScope(ctx) },
    });
    if (!page) throw new NotFoundError("Page not found");
    assertSameTenant(ctx, page.tenantId, "Page");

    if (body.path && body.path !== page.path) {
      const clash = await prisma.page.findFirst({
        where: {
          websiteId: page.websiteId,
          path: body.path,
          ...tenantScope(ctx),
          NOT: { id: page.id },
        },
      });
      if (clash) {
        throw new AppError("A page with this path already exists", 409, "PATH_EXISTS");
      }
    }

    const updated = await prisma.page.update({
      where: { id: page.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.path !== undefined ? { path: body.path } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
        ...(body.seoDescription !== undefined
          ? { seoDescription: body.seoDescription }
          : {}),
      },
      select: {
        id: true,
        title: true,
        path: true,
        status: true,
        sortOrder: true,
        seoTitle: true,
        seoDescription: true,
        updatedAt: true,
      },
    });

    return jsonOk({ page: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Delete a page (versions cascade). Tenant-scoped. */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { pageId } = await params;

    const result = await prisma.page.deleteMany({
      where: { id: pageId, ...tenantScope(ctx) },
    });
    if (result.count === 0) throw new NotFoundError("Page not found");

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
