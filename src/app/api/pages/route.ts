import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { assertWithinPageLimit } from "@/lib/billing/limits";
import { prisma } from "@/lib/db";
import { AppError, NotFoundError } from "@/lib/errors";
import {
  requireTenantAccess,
  tenantScope,
} from "@/lib/tenant/access";
import { listPagesForTenant } from "@/lib/tenant/data";

const createPageSchema = z.object({
  title: z.string().min(1).max(120),
  path: z
    .string()
    .min(1)
    .max(200)
    .transform((p) => (p.startsWith("/") ? p : `/${p}`)),
  duplicateFromPageId: z.string().min(1).optional(),
});

/**
 * Lists pages for the authenticated user's tenant only.
 * Tenant identity comes from the session membership — never from a query param.
 */
export async function GET() {
  try {
    const pages = await listPagesForTenant();
    return jsonOk({ pages });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Create a page with an empty DRAFT version. Tenant-scoped. */
export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createPageSchema.parse(await request.json());

    await assertWithinPageLimit(ctx.tenant.id);

    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: { id: true },
    });
    if (!website) throw new NotFoundError("Website not found");

    const existing = await prisma.page.findFirst({
      where: {
        websiteId: website.id,
        path: body.path,
        ...tenantScope(ctx),
      },
    });
    if (existing) {
      throw new AppError("A page with this path already exists", 409, "PATH_EXISTS");
    }

    let draftContent: Prisma.InputJsonValue = {
      sections: [],
    } as Prisma.InputJsonValue;

    if (body.duplicateFromPageId) {
      const source = await prisma.page.findFirst({
        where: {
          id: body.duplicateFromPageId,
          ...tenantScope(ctx),
        },
        include: {
          versions: {
            where: { kind: "DRAFT" },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });
      if (!source) throw new NotFoundError("Source page not found");
      const sourceDraft = source.versions[0];
      if (sourceDraft) {
        draftContent = sourceDraft.content as Prisma.InputJsonValue;
      }
    }

    const maxSort = await prisma.page.aggregate({
      where: { websiteId: website.id, ...tenantScope(ctx) },
      _max: { sortOrder: true },
    });

    const page = await prisma.page.create({
      data: {
        websiteId: website.id,
        tenantId: ctx.tenant.id,
        title: body.title,
        path: body.path,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        status: "DRAFT",
        versions: {
          create: {
            tenantId: ctx.tenant.id,
            kind: "DRAFT",
            version: 1,
            content: draftContent,
            createdById: ctx.user.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        path: true,
        status: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "page.created",
      meta: {
        pageId: page.id,
        path: page.path,
        ...(body.duplicateFromPageId
          ? { duplicatedFrom: body.duplicateFromPageId }
          : {}),
      },
    });

    return jsonOk({ page }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
