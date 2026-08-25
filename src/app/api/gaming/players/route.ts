import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  teamId: z.string().cuid().optional().nullable(),
  gamertag: z.string().max(80).optional().nullable(),
  role: z.string().max(80).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  stats: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const players = await prisma.player.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
      include: { team: true },
    });
    return jsonOk({ players });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());

    if (body.teamId) {
      const team = await prisma.team.findFirst({
        where: { id: body.teamId, ...tenantScope(ctx) },
      });
      if (!team) throw new NotFoundError("Team not found");
    }

    const player = await prisma.player.create({
      data: {
        name: body.name,
        teamId: body.teamId ?? null,
        gamertag: body.gamertag ?? null,
        role: body.role ?? null,
        avatarUrl: body.avatarUrl ?? null,
        stats: (body.stats ?? undefined) as Prisma.InputJsonValue | undefined,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ player }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
