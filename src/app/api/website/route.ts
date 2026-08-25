import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
} from "@/lib/tenant/access";
import { TEMPLATE_KEYS } from "@/lib/templates/catalog";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  templateKey: z
    .string()
    .nullable()
    .optional()
    .refine(
      (k) => k === null || k === undefined || TEMPLATE_KEYS.includes(k),
      "Unknown template",
    ),
});

const select = {
  id: true,
  name: true,
  templateKey: true,
} as const;

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: select,
    });
    if (!website) throw new NotFoundError("Website not found");
    return jsonOk({ website, templates: TEMPLATE_KEYS });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = patchSchema.parse(await request.json());

    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: { id: true, tenantId: true },
    });
    if (!website) throw new NotFoundError("Website not found");
    assertSameTenant(ctx, website.tenantId, "Website");

    const updated = await prisma.website.update({
      where: { id: website.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.templateKey !== undefined
          ? { templateKey: body.templateKey }
          : {}),
      },
      select,
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "website.updated",
      meta: { name: body.name, templateKey: body.templateKey },
    });

    return jsonOk({ website: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
