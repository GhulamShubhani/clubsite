import { z } from "zod";
import type { InputJsonValue } from "@/lib/prisma/json";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
} from "@/lib/tenant/access";
import { publishPage } from "@/lib/pages/versions";

type Params = { params: Promise<{ pageId: string }> };

const restoreSchema = z.object({
  versionId: z.string().min(1),
  publish: z.boolean().optional(),
});

/** List version history for a page (tenant-scoped). */
export async function GET(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const { pageId } = await params;

    const page = await prisma.page.findFirst({
      where: { id: pageId, ...tenantScope(ctx) },
      select: { id: true, tenantId: true },
    });
    if (!page) throw new NotFoundError("Page not found");
    assertSameTenant(ctx, page.tenantId, "Page");

    const versions = await prisma.pageVersion.findMany({
      where: { pageId: page.id, ...tenantScope(ctx) },
      orderBy: [{ kind: "asc" }, { version: "desc" }],
      select: {
        id: true,
        kind: true,
        version: true,
        publishedAt: true,
        createdAt: true,
        createdById: true,
      },
    });

    return jsonOk({ versions });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Restore a HISTORY or PUBLISHED version into the current DRAFT.
 * When `publish` is true, also promotes the restored draft live.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { pageId } = await params;
    const body = restoreSchema.parse(await request.json());

    const page = await prisma.page.findFirst({
      where: { id: pageId, ...tenantScope(ctx) },
      select: { id: true, tenantId: true },
    });
    if (!page) throw new NotFoundError("Page not found");
    assertSameTenant(ctx, page.tenantId, "Page");

    const source = await prisma.pageVersion.findFirst({
      where: {
        id: body.versionId,
        pageId: page.id,
        kind: { in: ["HISTORY", "PUBLISHED"] },
        ...tenantScope(ctx),
      },
    });
    if (!source) throw new NotFoundError("Version not found");

    const draft = await prisma.pageVersion.findFirst({
      where: {
        pageId: page.id,
        kind: "DRAFT",
        ...tenantScope(ctx),
      },
      orderBy: { version: "desc" },
    });

    let draftResult: { id: string; version: number; restoredFrom: string };

    if (draft) {
      const updated = await prisma.pageVersion.update({
        where: { id: draft.id },
        data: {
          content: source.content as InputJsonValue,
          createdById: ctx.user.id,
        },
      });
      draftResult = {
        id: updated.id,
        version: updated.version,
        restoredFrom: source.id,
      };
    } else {
      const created = await prisma.pageVersion.create({
        data: {
          pageId: page.id,
          tenantId: ctx.tenant.id,
          kind: "DRAFT",
          version: 1,
          content: source.content as InputJsonValue,
          createdById: ctx.user.id,
        },
      });
      draftResult = {
        id: created.id,
        version: created.version,
        restoredFrom: source.id,
      };
    }

    let published = null;
    if (body.publish) {
      published = await publishPage(pageId, ctx);
    }

    return jsonOk({
      ok: true,
      draft: draftResult,
      ...(published ? { published } : {}),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
