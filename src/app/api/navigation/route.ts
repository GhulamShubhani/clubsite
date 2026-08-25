import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertSameTenant, requireTenantAccess } from "@/lib/tenant/access";

const itemSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(300),
});

const putSchema = z.object({
  items: z.array(itemSchema).max(50),
  key: z.string().min(1).max(40).optional(),
});

async function getWebsite(tenantId: string) {
  const website = await prisma.website.findFirst({
    where: { tenantId },
    select: { id: true, tenantId: true },
  });
  if (!website) throw new NotFoundError("Website not found");
  return website;
}

/** Get main navigation items for the caller's tenant. */
export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const website = await getWebsite(ctx.tenant.id);
    assertSameTenant(ctx, website.tenantId, "Website");

    const nav = await prisma.navigation.findUnique({
      where: {
        websiteId_key: { websiteId: website.id, key: "main" },
      },
    });

    const items = Array.isArray(nav?.items) ? nav.items : [];
    return jsonOk({ items, key: "main" });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Replace navigation items. Requires EDITOR+. */
export async function PUT(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = putSchema.parse(await request.json());
    const key = body.key ?? "main";
    const website = await getWebsite(ctx.tenant.id);
    assertSameTenant(ctx, website.tenantId, "Website");

    const nav = await prisma.navigation.upsert({
      where: {
        websiteId_key: { websiteId: website.id, key },
      },
      create: {
        websiteId: website.id,
        tenantId: ctx.tenant.id,
        key,
        items: body.items as unknown as Prisma.InputJsonValue,
      },
      update: {
        items: body.items as unknown as Prisma.InputJsonValue,
      },
    });

    return jsonOk({ items: nav.items, key: nav.key });
  } catch (error) {
    return handleApiError(error);
  }
}
