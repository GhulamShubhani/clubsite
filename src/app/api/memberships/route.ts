import { MembershipRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

const roleSchema = z.nativeEnum(MembershipRole);

const inviteSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
});

const patchSchema = z.object({
  id: z.string().cuid(),
  role: roleSchema,
});

const deleteSchema = z.object({
  id: z.string().cuid(),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const members = await prisma.membership.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
    return jsonOk({ members });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "OWNER" });
    const body = inviteSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user) {
      throw new NotFoundError("User not found — they must register first");
    }

    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        role: body.role,
        ...tenantScope(ctx),
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });
    return jsonOk({ membership }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "OWNER" });
    const body = patchSchema.parse(await request.json());

    const existing = await prisma.membership.findFirst({
      where: { id: body.id, ...tenantScope(ctx) },
    });
    if (!existing) throw new NotFoundError("Membership not found");

    const membership = await prisma.membership.update({
      where: { id: body.id },
      data: { role: body.role },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "membership.role_changed",
      meta: { membershipId: body.id, role: body.role },
    });

    return jsonOk({ membership });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "OWNER" });
    const { searchParams } = new URL(request.url);
    const fromQuery = searchParams.get("id");
    const body = fromQuery
      ? deleteSchema.parse({ id: fromQuery })
      : deleteSchema.parse(await request.json());

    const existing = await prisma.membership.findFirst({
      where: { id: body.id, ...tenantScope(ctx) },
    });
    if (!existing) throw new NotFoundError("Membership not found");

    if (existing.id === ctx.membership.id && existing.role === "OWNER") {
      throw new ForbiddenError("Cannot remove your own OWNER membership");
    }

    await prisma.membership.delete({ where: { id: body.id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
