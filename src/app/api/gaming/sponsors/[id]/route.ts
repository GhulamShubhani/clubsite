import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  logoUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  tier: z.string().max(40).optional().nullable(),
});

async function findSponsor(id: string, tenantId: string) {
  const sponsor = await prisma.sponsor.findFirst({ where: { id, tenantId } });
  if (!sponsor) throw new NotFoundError("Sponsor not found");
  return sponsor;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findSponsor(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: body,
    });
    return jsonOk({ sponsor });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findSponsor(id, ctx.tenant.id);
    await prisma.sponsor.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
