import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  teamId: z.string().cuid().optional().nullable(),
  gamertag: z.string().max(80).optional().nullable(),
  role: z.string().max(80).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  stats: z.record(z.string(), z.unknown()).optional().nullable(),
});

async function findPlayer(id: string, tenantId: string) {
  const player = await prisma.player.findFirst({ where: { id, tenantId } });
  if (!player) throw new NotFoundError("Player not found");
  return player;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findPlayer(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());

    if (body.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: body.teamId, ...tenantScope(ctx) },
      });
      if (!team) throw new NotFoundError("Team not found");
    }

    const { stats, ...rest } = body;
    const player = await prisma.player.update({
      where: { id },
      data: {
        ...rest,
        ...(stats === undefined
          ? {}
          : {
              stats:
                stats === null
                  ? { set: null }
                  : (stats as Prisma.InputJsonValue),
            }),
      },
    });
    return jsonOk({ player });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findPlayer(id, ctx.tenant.id);
    await prisma.player.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
