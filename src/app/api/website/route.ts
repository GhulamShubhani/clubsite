import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  analyticsIdError,
  analyticsIdFromTokens,
} from "@/lib/analytics-id";
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
  googleAnalyticsId: z
    .string()
    .max(40)
    .nullable()
    .optional()
    .refine(
      (value) => !analyticsIdError(value ?? ""),
      "Use a valid ID such as G-XXXXXXXXXX, UA-XXXXXXX-X, or GTM-XXXXXXX.",
    ),
});

const websiteSelect = {
  id: true,
  name: true,
  templateKey: true,
} as const;

function withAnalyticsId(
  website: { id: string; name: string; templateKey: string | null },
  tokens: unknown,
) {
  return {
    id: website.id,
    name: website.name,
    templateKey: website.templateKey,
    googleAnalyticsId: analyticsIdFromTokens(tokens),
  };
}

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: {
        ...websiteSelect,
        theme: { select: { tokens: true } },
      },
    });
    if (!website) throw new NotFoundError("Website not found");
    return jsonOk({
      website: withAnalyticsId(website, website.theme?.tokens),
      templates: TEMPLATE_KEYS,
    });
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
      select: { id: true, tenantId: true, theme: { select: { tokens: true } } },
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
      select: websiteSelect,
    });

    let tokens: unknown = website.theme?.tokens;
    if (body.googleAnalyticsId !== undefined) {
      const current =
        tokens && typeof tokens === "object" && !Array.isArray(tokens)
          ? { ...(tokens as Record<string, unknown>) }
          : {};
      const nextId = body.googleAnalyticsId?.trim() || null;
      if (nextId) current.googleAnalyticsId = nextId;
      else delete current.googleAnalyticsId;
      const saved = await prisma.theme.upsert({
        where: { websiteId: website.id },
        create: {
          websiteId: website.id,
          tenantId: ctx.tenant.id,
          tokens: current as Prisma.InputJsonValue,
        },
        update: { tokens: current as Prisma.InputJsonValue },
        select: { tokens: true },
      });
      tokens = saved.tokens;
    }

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "website.updated",
      meta: { name: body.name, templateKey: body.templateKey },
    });

    return jsonOk({ website: withAnalyticsId(updated, tokens) });
  } catch (error) {
    return handleApiError(error);
  }
}
