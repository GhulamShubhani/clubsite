import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  logoUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  tier: z.string().max(40).optional().nullable(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const sponsors = await prisma.sponsor.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ sponsors });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const sponsor = await prisma.sponsor.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl ?? null,
        websiteUrl: body.websiteUrl ?? null,
        tier: body.tier ?? null,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ sponsor }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
