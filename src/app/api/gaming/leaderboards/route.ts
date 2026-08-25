import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  game: z.string().max(80).optional().nullable(),
  entries: z.unknown().default([]),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const leaderboards = await prisma.leaderboard.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ leaderboards });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const leaderboard = await prisma.leaderboard.create({
      data: {
        name: body.name,
        game: body.game ?? null,
        entries: (body.entries ?? []) as Prisma.InputJsonValue,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ leaderboard }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
