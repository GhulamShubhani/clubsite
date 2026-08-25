import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteMediaForTenant,
  listMediaForTenant,
} from "@/lib/tenant/data";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { assertWithinStorageLimit } from "@/lib/billing/limits";
import { AppError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";
import { prisma } from "@/lib/db";

const MAX_BYTES = 20_000_000;

function isAllowedMime(mime: string): boolean {
  if (mime.startsWith("image/")) return true;
  return mime === "video/mp4" || mime === "application/pdf";
}

const createMediaSchema = z.object({
  filename: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  mimeType: z
    .string()
    .min(1)
    .max(120)
    .refine(isAllowedMime, "MIME type not allowed"),
  sizeBytes: z.number().int().positive().max(MAX_BYTES),
  url: z.string().url(),
});

const renameSchema = z.object({
  id: z.string().cuid(),
  originalName: z.string().min(1).max(255),
});

/**
 * Media library is strictly tenant-scoped.
 * Club A can never list or mutate Club B's files.
 */
export async function GET(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const q = new URL(request.url).searchParams.get("q")?.trim();

    if (q) {
      const media = await prisma.media.findMany({
        where: {
          ...tenantScope(ctx),
          originalName: { contains: q, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
      });
      return jsonOk({ media });
    }

    const media = await listMediaForTenant(ctx);
    return jsonOk({ media });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createMediaSchema.parse(await request.json());

    await assertWithinStorageLimit(ctx.tenant.id, body.sizeBytes);

    const media = await prisma.media.create({
      data: {
        ...body,
        ...tenantScope(ctx),
      },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "media.created",
      meta: { mediaId: media.id },
    });

    return jsonOk({ media }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = renameSchema.parse(await request.json());

    const existing = await prisma.media.findFirst({
      where: { id: body.id, ...tenantScope(ctx) },
    });
    if (!existing) {
      throw new AppError("Media not found", 404, "NOT_FOUND");
    }

    const media = await prisma.media.update({
      where: { id: body.id },
      data: { originalName: body.originalName },
    });

    return jsonOk({ media });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("id");
    if (!mediaId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteMediaForTenant(mediaId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
