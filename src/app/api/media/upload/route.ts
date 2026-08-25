import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { assertWithinStorageLimit } from "@/lib/billing/limits";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const MAX_BYTES = 20_000_000;

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
]);

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
};

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      throw new AppError("file is required", 400, "VALIDATION");
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED.has(mimeType)) {
      throw new AppError(
        "Only jpeg, png, webp, gif, and mp4 are allowed",
        400,
        "MIME_NOT_ALLOWED",
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      throw new AppError("File must be between 1 byte and 20MB", 400, "SIZE");
    }

    await assertWithinStorageLimit(ctx.tenant.id, file.size);

    const ext = EXT[mimeType] ?? "";
    const filename = `${randomUUID()}${ext}`;
    const dir = path.join(
      process.cwd(),
      "public",
      "uploads",
      ctx.tenant.id,
    );
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const url = `/uploads/${ctx.tenant.id}/${filename}`;
    const originalName = file.name || filename;

    const media = await prisma.media.create({
      data: {
        filename,
        originalName,
        mimeType,
        sizeBytes: file.size,
        url,
        ...tenantScope(ctx),
      },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "media.uploaded",
      meta: { mediaId: media.id, sizeBytes: file.size },
    });

    return jsonOk({ media }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
