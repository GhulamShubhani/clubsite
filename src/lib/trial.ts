import type { Prisma, PrismaClient, Subscription } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

/** Used only to seed PlatformSetting on first run — runtime length always comes from DB. */
const SEED_DEFAULT_TRIAL_MINUTES = 60;

export type TrialSnapshot = {
  status: Subscription["status"];
  planKey: string;
  trialStartsAt: Date;
  trialEndsAt: Date;
  isActive: boolean;
  isExpired: boolean;
  remainingMs: number;
  /** True when publishing / premium actions should be blocked. */
  blocksPublishing: boolean;
};

/**
 * Reads the platform default trial length from the database (not hard-coded in call sites).
 * Ensures PlatformSetting exists, then returns a start/end window.
 */
export async function getDefaultTrialWindow(db: DbClient): Promise<{
  trialStartsAt: Date;
  trialEndsAt: Date;
  durationMinutes: number;
}> {
  const setting = await db.platformSetting.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      defaultTrialMinutes: SEED_DEFAULT_TRIAL_MINUTES,
    },
    update: {},
  });

  const durationMinutes = setting.defaultTrialMinutes;
  const trialStartsAt = new Date();
  const trialEndsAt = new Date(
    trialStartsAt.getTime() + durationMinutes * 60_000,
  );

  return { trialStartsAt, trialEndsAt, durationMinutes };
}

/**
 * Update the platform-wide default trial length (minutes).
 * Existing tenants keep their stored trialStartsAt / trialEndsAt unchanged.
 */
export async function setDefaultTrialMinutes(
  db: DbClient,
  minutes: number,
): Promise<{ defaultTrialMinutes: number }> {
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60 * 24 * 365) {
    throw new Error("defaultTrialMinutes must be an integer between 1 and 525600");
  }

  const setting = await db.platformSetting.upsert({
    where: { id: "default" },
    create: { id: "default", defaultTrialMinutes: minutes },
    update: { defaultTrialMinutes: minutes },
  });

  return { defaultTrialMinutes: setting.defaultTrialMinutes };
}

export function buildTrialSnapshot(
  subscription: Pick<
    Subscription,
    "status" | "planKey" | "trialStartsAt" | "trialEndsAt"
  >,
  now = new Date(),
): TrialSnapshot {
  const remainingMs = subscription.trialEndsAt.getTime() - now.getTime();
  const isTrial = subscription.status === "TRIAL";
  const isExpired =
    subscription.status === "EXPIRED" || (isTrial && remainingMs <= 0);
  const isActive = isTrial && remainingMs > 0;

  return {
    status: isExpired && isTrial ? "EXPIRED" : subscription.status,
    planKey: subscription.planKey,
    trialStartsAt: subscription.trialStartsAt,
    trialEndsAt: subscription.trialEndsAt,
    isActive,
    isExpired,
    remainingMs: Math.max(0, remainingMs),
    // Trial expiry keeps data; publishing is restricted until upgrade.
    blocksPublishing: isExpired || subscription.status === "CANCELED",
  };
}

export function isTrialActive(
  subscription: Pick<Subscription, "status" | "trialEndsAt">,
  now = new Date(),
): boolean {
  return buildTrialSnapshot(
    {
      ...subscription,
      planKey: "trial",
      trialStartsAt: now,
    },
    now,
  ).isActive;
}

export function isTrialExpired(
  subscription: Pick<Subscription, "status" | "trialEndsAt">,
  now = new Date(),
): boolean {
  return buildTrialSnapshot(
    {
      ...subscription,
      planKey: "trial",
      trialStartsAt: now,
    },
    now,
  ).isExpired;
}

/**
 * Mark TRIAL subscriptions past trialEndsAt as EXPIRED (data retained).
 */
export async function syncExpiredTrial(
  db: DbClient,
  tenantId: string,
  now = new Date(),
): Promise<TrialSnapshot | null> {
  const subscription = await db.subscription.findUnique({
    where: { tenantId },
  });
  if (!subscription) return null;

  const snapshot = buildTrialSnapshot(subscription, now);

  if (subscription.status === "TRIAL" && snapshot.isExpired) {
    const updated = await db.subscription.update({
      where: { tenantId },
      data: { status: "EXPIRED" },
    });
    return buildTrialSnapshot(updated, now);
  }

  return snapshot;
}

export async function getTenantTrial(
  db: DbClient,
  tenantId: string,
  now = new Date(),
): Promise<TrialSnapshot | null> {
  return syncExpiredTrial(db, tenantId, now);
}
