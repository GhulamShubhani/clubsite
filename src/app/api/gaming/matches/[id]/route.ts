import { MatchStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  tournamentId: z.string().cuid().optional().nullable(),
  game: z.string().max(80).optional().nullable(),
  status: z.nativeEnum(MatchStatus).optional(),
  startsAt: z.coerce.date().optional().nullable(),
  teamAName: z.string().max(120).optional().nullable(),
  teamBName: z.string().max(120).optional().nullable(),
  scoreA: z.number().int().optional().nullable(),
  scoreB: z.number().int().optional().nullable(),
});

async function findMatch(id: string, tenantId: string) {
  const match = await prisma.match.findFirst({ where: { id, tenantId } });
  if (!match) throw new NotFoundError("Match not found");
  return match;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findMatch(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());

    if (body.tournamentId) {
      const tournament = await prisma.tournament.findFirst({
        where: { id: body.tournamentId, ...tenantScope(ctx) },
      });
      if (!tournament) throw new NotFoundError("Tournament not found");
    }

    const match = await prisma.match.update({
      where: { id },
      data: body,
    });
    return jsonOk({ match });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findMatch(id, ctx.tenant.id);
    await prisma.match.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
