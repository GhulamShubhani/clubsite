import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(4000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

async function findEvent(id: string, tenantId: string) {
  const event = await prisma.clubEvent.findFirst({ where: { id, tenantId } });
  if (!event) throw new NotFoundError("Event not found");
  return event;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findEvent(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const event = await prisma.clubEvent.update({
      where: { id },
      data: body,
    });
    return jsonOk({ event });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findEvent(id, ctx.tenant.id);
    await prisma.clubEvent.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
