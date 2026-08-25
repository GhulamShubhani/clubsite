import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const events = await prisma.clubEvent.findMany({
      where: tenantScope(ctx),
      orderBy: { startsAt: "asc" },
    });
    return jsonOk({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const event = await prisma.clubEvent.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        location: body.location ?? null,
        startsAt: body.startsAt ?? null,
        endsAt: body.endsAt ?? null,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ event }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
