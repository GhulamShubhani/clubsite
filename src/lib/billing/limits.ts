import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getPlan } from "@/lib/billing/plans";

async function getEffectiveLimits(tenantId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    select: { planKey: true, pageLimit: true, storageMbLimit: true },
  });
  const defaults = getPlan(sub?.planKey ?? "trial");
  return {
    pageLimit: sub?.pageLimit ?? defaults.pageLimit,
    storageMbLimit: sub?.storageMbLimit ?? defaults.storageMbLimit,
  };
}

export async function assertWithinPageLimit(tenantId: string) {
  const { pageLimit } = await getEffectiveLimits(tenantId);
  const count = await prisma.page.count({ where: { tenantId } });
  if (count >= pageLimit) {
    throw new AppError(
      `Page limit of ${pageLimit} reached. Upgrade your plan to add more pages.`,
      402,
      "LIMIT_REACHED",
    );
  }
}

export async function assertWithinStorageLimit(
  tenantId: string,
  addBytes: number,
) {
  const { storageMbLimit } = await getEffectiveLimits(tenantId);
  const agg = await prisma.media.aggregate({
    where: { tenantId },
    _sum: { sizeBytes: true },
  });
  const used = agg._sum.sizeBytes ?? 0;
  const limitBytes = storageMbLimit * 1024 * 1024;
  if (used + addBytes > limitBytes) {
    throw new AppError(
      `Storage limit of ${storageMbLimit} MB reached. Upgrade your plan for more space.`,
      402,
      "LIMIT_REACHED",
    );
  }
}
