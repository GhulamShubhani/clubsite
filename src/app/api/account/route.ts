import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { auth } from "@/lib/auth";
import { requireTenantAccess } from "@/lib/tenant/access";

const patchSchema = z
  .object({
    fullName: z.string().min(2).max(120).optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(8).max(128).optional(),
  })
  .refine(
    (v) =>
      v.fullName !== undefined ||
      (v.currentPassword !== undefined && v.newPassword !== undefined),
    { message: "Provide fullName and/or password change fields" },
  )
  .refine(
    (v) =>
      (v.currentPassword === undefined && v.newPassword === undefined) ||
      (v.currentPassword !== undefined && v.newPassword !== undefined),
    { message: "Both currentPassword and newPassword are required" },
  );

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    return jsonOk({
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        fullName: ctx.user.fullName,
      },
      role: ctx.membership.role,
      tenant: ctx.tenant,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const body = patchSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const data: { fullName?: string; passwordHash?: string } = {};

    if (body.fullName !== undefined) {
      data.fullName = body.fullName;
    }

    if (body.currentPassword && body.newPassword) {
      const ok = await compare(body.currentPassword, user.passwordHash);
      if (!ok) {
        throw new AppError("Current password is incorrect", 400, "BAD_PASSWORD");
      }
      data.passwordHash = await hash(body.newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, email: true, fullName: true },
    });

    let tenantId: string | null = null;
    try {
      const ctx = await requireTenantAccess({ minRole: "VIEWER" });
      tenantId = ctx.tenant.id;
    } catch {
      // account update works without tenant context
    }

    await writeAudit({
      tenantId,
      userId: user.id,
      action: "account.updated",
      meta: {
        fullName: body.fullName !== undefined,
        password: !!body.newPassword,
      },
    });

    return jsonOk({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
