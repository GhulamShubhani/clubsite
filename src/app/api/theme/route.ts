import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { assertSameTenant, requireTenantAccess } from "@/lib/tenant/access";

const defaultTokens = {
  primary: "#6366f1",
  secondary: "#1e1b4b",
  accent: "#22d3ee",
  background: "#0f172a",
  surface: "#1e293b",
  text: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(148, 163, 184, 0.2)",
  fontHeading: "Orbitron, system-ui, sans-serif",
  fontBody: "Inter, system-ui, sans-serif",
  fontFamily: "Inter, system-ui, sans-serif",
};

const tokensSchema = z.object({
  primary: z.string().min(1).max(80).optional(),
  secondary: z.string().min(1).max(80).optional(),
  accent: z.string().min(1).max(80).optional(),
  background: z.string().min(1).max(80).optional(),
  surface: z.string().min(1).max(80).optional(),
  text: z.string().min(1).max(80).optional(),
  muted: z.string().min(1).max(80).optional(),
  border: z.string().min(1).max(120).optional(),
  fontHeading: z.string().min(1).max(120).optional(),
  fontBody: z.string().min(1).max(120).optional(),
  fontFamily: z.string().min(1).max(120).optional(),
});

const putSchema = z.object({
  tokens: tokensSchema,
});

async function getWebsite(tenantId: string) {
  const website = await prisma.website.findFirst({
    where: { tenantId },
    select: { id: true, tenantId: true },
  });
  if (!website) throw new NotFoundError("Website not found");
  return website;
}

function mergeTokens(raw: unknown) {
  const current =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    ...defaultTokens,
    ...Object.fromEntries(
      Object.entries(current).filter(([, v]) => typeof v === "string"),
    ),
  };
}

/** Get theme tokens for the caller's tenant. */
export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const website = await getWebsite(ctx.tenant.id);
    assertSameTenant(ctx, website.tenantId, "Website");

    const theme = await prisma.theme.findUnique({
      where: { websiteId: website.id },
    });

    return jsonOk({ tokens: mergeTokens(theme?.tokens) });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Replace theme tokens. Requires EDITOR+. */
export async function PUT(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = putSchema.parse(await request.json());
    const website = await getWebsite(ctx.tenant.id);
    assertSameTenant(ctx, website.tenantId, "Website");

    const existing = await prisma.theme.findUnique({
      where: { websiteId: website.id },
    });
    const tokens = {
      ...mergeTokens(existing?.tokens),
      ...body.tokens,
    };

    const theme = await prisma.theme.upsert({
      where: { websiteId: website.id },
      create: {
        websiteId: website.id,
        tenantId: ctx.tenant.id,
        tokens: tokens as Prisma.InputJsonValue,
      },
      update: {
        tokens: tokens as Prisma.InputJsonValue,
      },
    });

    return jsonOk({ tokens: mergeTokens(theme.tokens) });
  } catch (error) {
    return handleApiError(error);
  }
}
