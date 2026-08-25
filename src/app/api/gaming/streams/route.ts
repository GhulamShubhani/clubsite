import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const createSchema = z.object({
  title: z.string().min(1).max(160),
  platform: z.string().min(1).max(40),
  url: z.string().url(),
  embedUrl: z.string().url().optional().nullable(),
  isLive: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const streams = await prisma.stream.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ streams });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const stream = await prisma.stream.create({
      data: {
        title: body.title,
        platform: body.platform,
        url: body.url,
        embedUrl: body.embedUrl ?? null,
        isLive: body.isLive ?? false,
        ...tenantScope(ctx),
      },
    });
    return jsonOk({ stream }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
