import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function writeAudit(input: {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  meta?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        meta: input.meta ?? undefined,
      },
    });
  } catch (error) {
    console.error("audit write failed", error);
  }
}
