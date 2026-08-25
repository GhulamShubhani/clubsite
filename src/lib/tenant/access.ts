import type { Membership, MembershipRole, Tenant, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  roleAtLeast,
} from "@/lib/errors";
import { auth } from "@/lib/auth";

/**
 * Authenticated tenant context resolved entirely on the server.
 * Never trust a tenantId / role from the browser — always derive from session + DB membership.
 */
export type TenantContext = {
  user: Pick<User, "id" | "email" | "fullName">;
  tenant: Pick<Tenant, "id" | "name" | "slug">;
  membership: Pick<Membership, "id" | "role" | "tenantId" | "userId">;
};

/**
 * Require a logged-in user. Does not accept any client-supplied identity.
 */
export async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user as { id: string; email: string; name?: string | null };
}

/**
 * Resolve tenant access from the authenticated membership.
 * Optional `tenantIdOrSlug` must match a membership row for the current user —
 * a foreign tenant id never grants access.
 */
export async function requireTenantAccess(options?: {
  /** Tenant id or slug. If omitted, uses the user's first membership (single-club MVP). */
  tenantIdOrSlug?: string;
  /** Minimum role required for this operation. */
  minRole?: MembershipRole;
}): Promise<TenantContext> {
  const user = await requireSessionUser();
  const minRole = options?.minRole ?? "VIEWER";

  const membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      ...(options?.tenantIdOrSlug
        ? {
            OR: [
              { tenantId: options.tenantIdOrSlug },
              { tenant: { slug: options.tenantIdOrSlug } },
            ],
          }
        : {}),
    },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, email: true, fullName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    throw new ForbiddenError("No membership for this club workspace");
  }

  if (!roleAtLeast(membership.role, minRole)) {
    throw new ForbiddenError(
      `Requires ${minRole} role or higher (you are ${membership.role})`,
    );
  }

  return {
    user: membership.user,
    tenant: membership.tenant,
    membership: {
      id: membership.id,
      role: membership.role,
      tenantId: membership.tenantId,
      userId: membership.userId,
    },
  };
}

/**
 * Assert that a resource's tenantId matches the authorized context.
 * Use after every fetch of a tenant-owned row.
 */
export function assertSameTenant(
  ctx: TenantContext,
  resourceTenantId: string | null | undefined,
  resourceLabel = "resource",
): void {
  if (!resourceTenantId || resourceTenantId !== ctx.tenant.id) {
    // Same response as missing — do not leak cross-tenant existence.
    throw new NotFoundError(`${resourceLabel} not found`);
  }
}

/**
 * Build a Prisma `where` clause that always includes the authorized tenantId.
 * Prevents accidental unscoped queries.
 */
export function tenantScope(ctx: TenantContext) {
  return { tenantId: ctx.tenant.id } as const;
}
