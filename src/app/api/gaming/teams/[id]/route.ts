import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  tag: z.string().max(32).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  game: z.string().max(80).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

async function findTeam(id: string, tenantId: string) {
  const team = await prisma.team.findFirst({ where: { id, tenantId } });
  if (!team) throw new NotFoundError("Team not found");
  return team;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const { id } = await params;
    const team = await prisma.team.findFirst({
      where: { id, ...tenantScope(ctx) },
      include: { players: true },
    });
    if (!team) throw new NotFoundError("Team not found");
    return jsonOk({ team });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findTeam(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const team = await prisma.team.update({
      where: { id },
      data: body,
    });
    return jsonOk({ team });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findTeam(id, ctx.tenant.id);
    await prisma.team.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
