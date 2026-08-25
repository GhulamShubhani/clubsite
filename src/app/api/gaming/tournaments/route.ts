import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  name: z.string().min(1).max(160),
  game: z.string().max(80).optional().nullable(),
  prizePool: z.string().max(120).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  bracket: z.unknown().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const tournaments = await prisma.tournament.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
      include: { matches: true },
    });
    return jsonOk({ tournaments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const tournament = await prisma.tournament.create({
      data: {
        name: body.name,
        game: body.game ?? null,
        prizePool: body.prizePool ?? null,
        startsAt: body.startsAt ?? null,
        endsAt: body.endsAt ?? null,
        description: body.description ?? null,
        bracket: (body.bracket ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ tournament }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
