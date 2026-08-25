import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(160).optional(),
  game: z.string().max(80).optional().nullable(),
  prizePool: z.string().max(120).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  description: z.string().max(4000).optional().nullable(),
  bracket: z.unknown().optional().nullable(),
});

async function findTournament(id: string, tenantId: string) {
  const tournament = await prisma.tournament.findFirst({
    where: { id, tenantId },
  });
  if (!tournament) throw new NotFoundError("Tournament not found");
  return tournament;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findTournament(id, ctx.tenant.id);
    const body = updateSchema.parse(await request.json());
    const { bracket, ...rest } = body;
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        ...rest,
        ...(bracket === undefined
          ? {}
          : {
              bracket:
                bracket === null
                  ? { set: null }
                  : (bracket as Prisma.InputJsonValue),
            }),
      },
    });
    return jsonOk({ tournament });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const { id } = await params;
    await findTournament(id, ctx.tenant.id);
    await prisma.tournament.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
