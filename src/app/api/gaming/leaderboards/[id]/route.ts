import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  game: z.string().max(80).optional().nullable(),
  entries: z.unknown().optional(),
});

async function findLeaderboard(id: string, tenantId: string) {
  const leaderboard = await prisma.leaderboard.findFirst({
    where: { id, tenantId },
  });
  if (!leaderboard) throw new NotFoundError("Leaderboard not found");
  return leaderboard;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findLeaderboard(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const { entries, ...rest } = body;
    const leaderboard = await prisma.leaderboard.update({
      where: { id },
      data: {
        ...rest,
        ...(entries === undefined
          ? {}
          : { entries: entries as Prisma.InputJsonValue }),
      },
    });
    return jsonOk({ leaderboard });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findLeaderboard(id, ctx.tenant.id);
    await prisma.leaderboard.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
