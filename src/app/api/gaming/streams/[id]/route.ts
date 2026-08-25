import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  platform: z.string().min(1).max(40).optional(),
  url: z.string().url().optional(),
  embedUrl: z.string().url().optional().nullable(),
  isLive: z.boolean().optional(),
});

async function findStream(id: string, tenantId: string) {
  const stream = await prisma.stream.findFirst({ where: { id, tenantId } });
  if (!stream) throw new NotFoundError("Stream not found");
  return stream;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findStream(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const stream = await prisma.stream.update({
      where: { id },
      data: body,
    });
    return jsonOk({ stream });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findStream(id, ctx.tenant.id);
    await prisma.stream.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
