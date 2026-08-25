import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  tag: z.string().max(32).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  game: z.string().max(80).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const teams = await prisma.team.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
      include: { players: true },
    });
    return jsonOk({ teams });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const team = await prisma.team.create({
      data: { ...body, ...tenantScope(ctx) },
    });
    return jsonOk({ team }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
