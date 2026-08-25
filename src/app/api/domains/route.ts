import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { AppError, NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

/**
 * MVP custom domains:
 * - POST adds a custom hostname (unverified).
 * - PATCH verify marks verifiedAt after a basic hostname format check.
 * - DNS / ownership proof is not enforced in MVP — verify is an OWNER action.
 * - Public resolution only uses domains with verifiedAt set (or isCustom=false).
 */

const hostnameRegex =
  /^(?=.{1,253}$)(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

const createSchema = z.object({
  hostname: z
    .string()
    .min(1)
    .max(253)
    .transform((h) => h.toLowerCase().trim())
    .refine((h) => hostnameRegex.test(h), "Invalid hostname"),
});

const verifySchema = z.object({
  id: z.string().cuid(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const domains = await prisma.domain.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "asc" },
    });
    return jsonOk({ domains });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = createSchema.parse(await request.json());
    const domain = await prisma.domain.create({
      data: {
        hostname: body.hostname,
        isCustom: true,
        isPrimary: false,
        ...tenantScope(ctx),
      },
    });
    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "domain.created",
      meta: { domainId: domain.id, hostname: domain.hostname },
    });
    return jsonOk({ domain }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "OWNER" });
    const body = verifySchema.parse(await request.json());
    const existing = await prisma.domain.findFirst({
      where: { id: body.id, ...tenantScope(ctx) },
    });
    if (!existing) throw new NotFoundError("Domain not found");

    if (!hostnameRegex.test(existing.hostname)) {
      throw new AppError("Hostname is not valid", 400, "INVALID_HOSTNAME");
    }

    const domain = await prisma.domain.update({
      where: { id: body.id },
      data: { verifiedAt: new Date() },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "domain.verified",
      meta: { domainId: domain.id, hostname: domain.hostname },
    });

    return jsonOk({ domain });
  } catch (error) {
    return handleApiError(error);
  }
}
