import { MembershipRole } from "@prisma/client";

export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

/** Role hierarchy: higher index = more privilege. */
const ROLE_RANK: Record<MembershipRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function roleAtLeast(
  actual: MembershipRole,
  required: MembershipRole,
): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}
