import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
} from "@/lib/tenant/access";

const seoSchema = z.object({
  seoTitle: z.string().max(200).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  faviconUrl: z.string().url().nullable().optional().or(z.literal("")),
  ogImageUrl: z.string().url().nullable().optional().or(z.literal("")),
  canonicalUrl: z.string().url().nullable().optional().or(z.literal("")),
  robotsIndex: z.boolean().optional(),
});

const seoSelect = {
  seoTitle: true,
  seoDescription: true,
  faviconUrl: true,
  ogImageUrl: true,
  canonicalUrl: true,
  robotsIndex: true,
} as const;

function emptyToNull(v: string | null | undefined) {
  if (v === "") return null;
  return v;
}

/** Get website SEO fields for the caller's tenant. */
export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: seoSelect,
    });
    if (!website) throw new NotFoundError("Website not found");
    return jsonOk({ seo: website });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Patch website SEO fields. Requires EDITOR+. */
export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = seoSchema.parse(await request.json());

    const website = await prisma.website.findFirst({
      where: tenantScope(ctx),
      select: { id: true, tenantId: true },
    });
    if (!website) throw new NotFoundError("Website not found");
    assertSameTenant(ctx, website.tenantId, "Website");

    const updated = await prisma.website.update({
      where: { id: website.id },
      data: {
        ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
        ...(body.seoDescription !== undefined
          ? { seoDescription: body.seoDescription }
          : {}),
        ...(body.faviconUrl !== undefined
          ? { faviconUrl: emptyToNull(body.faviconUrl) }
          : {}),
        ...(body.ogImageUrl !== undefined
          ? { ogImageUrl: emptyToNull(body.ogImageUrl) }
          : {}),
        ...(body.canonicalUrl !== undefined
          ? { canonicalUrl: emptyToNull(body.canonicalUrl) }
          : {}),
        ...(body.robotsIndex !== undefined
          ? { robotsIndex: body.robotsIndex }
          : {}),
      },
      select: seoSelect,
    });

    return jsonOk({ seo: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
