import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const matchStatus = z.nativeEnum(MatchStatus);

const createSchema = z.object({
  title: z.string().min(1).max(160),
  tournamentId: z.string().cuid().optional().nullable(),
  game: z.string().max(80).optional().nullable(),
  status: matchStatus.optional(),
  startsAt: z.coerce.date().optional().nullable(),
  teamAName: z.string().max(120).optional().nullable(),
  teamBName: z.string().max(120).optional().nullable(),
  scoreA: z.number().int().optional().nullable(),
  scoreB: z.number().int().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const matches = await prisma.match.findMany({
      where: tenantScope(ctx),
      orderBy: { startsAt: "asc" },
      include: { tournament: true },
    });
    return jsonOk({ matches });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());

    if (body.tournamentId) {
      const tournament = await prisma.tournament.findFirst({
        where: { id: body.tournamentId, ...tenantScope(ctx) },
      });
      if (!tournament) throw new NotFoundError("Tournament not found");
    }

    const match = await prisma.match.create({
      data: {
        title: body.title,
        tournamentId: body.tournamentId ?? null,
        game: body.game ?? null,
        status: body.status ?? MatchStatus.UPCOMING,
        startsAt: body.startsAt ?? null,
        teamAName: body.teamAName ?? null,
        teamBName: body.teamBName ?? null,
        scoreA: body.scoreA ?? null,
        scoreB: body.scoreB ?? null,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ match }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
