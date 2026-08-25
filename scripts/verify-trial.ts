/**
 * Verifies configurable trial periods use DB start/end dates — not hard-coded durations.
 *
 * Run: npx tsx scripts/verify-trial.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { createTenantWorkspace } from "../src/lib/tenant/create";
import {
  buildTrialSnapshot,
  getDefaultTrialWindow,
  setDefaultTrialMinutes,
  syncExpiredTrial,
} from "../src/lib/trial";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main() {
  // 1) Change platform default to 120 minutes — new clubs pick this up
  await setDefaultTrialMinutes(prisma, 120);
  const window = await getDefaultTrialWindow(prisma);
  assert(window.durationMinutes === 120, "default trial minutes from DB");

  const deltaMs = window.trialEndsAt.getTime() - window.trialStartsAt.getTime();
  assert(deltaMs === 120 * 60_000, "start/end span matches DB duration");

  // 2) Create a club — subscription stores concrete dates
  await prisma.user.deleteMany({ where: { email: "trial@example.com" } });
  await prisma.tenant.deleteMany({ where: { slug: "trial-club" } });

  const user = await prisma.user.create({
    data: {
      email: "trial@example.com",
      fullName: "Trial Owner",
      passwordHash: await hash("password123", 10),
    },
  });

  const workspace = await createTenantWorkspace(prisma, {
    clubName: "Trial Club",
    slug: "trial-club",
    ownerUserId: user.id,
  });

  const sub = workspace.subscription;
  assert(sub.status === "TRIAL", "status TRIAL");
  assert(!!sub.trialStartsAt && !!sub.trialEndsAt, "dates stored on subscription");

  const span =
    sub.trialEndsAt.getTime() - sub.trialStartsAt.getTime();
  assert(span === 120 * 60_000, "club trial uses DB-configured length");

  const active = buildTrialSnapshot(sub);
  assert(active.isActive === true, "trial currently active");
  assert(active.blocksPublishing === false, "publishing allowed during trial");

  // 3) Changing default again must NOT rewrite existing club dates
  await setDefaultTrialMinutes(prisma, 60);
  const refreshed = await prisma.subscription.findUniqueOrThrow({
    where: { tenantId: workspace.tenant.id },
  });
  assert(
    refreshed.trialEndsAt.getTime() === sub.trialEndsAt.getTime(),
    "existing trialEndsAt unchanged after platform default change",
  );

  // 4) Expire by rewriting end date in DB (simulates time passing)
  await prisma.subscription.update({
    where: { tenantId: workspace.tenant.id },
    data: { trialEndsAt: new Date(Date.now() - 1000) },
  });

  const expired = await syncExpiredTrial(prisma, workspace.tenant.id);
  assert(expired?.isExpired === true, "trial expired from stored end date");
  assert(expired?.blocksPublishing === true, "publishing blocked after expiry");
  assert(expired?.status === "EXPIRED", "status flipped to EXPIRED");

  // Data retained
  const tenantStillThere = await prisma.tenant.findUnique({
    where: { id: workspace.tenant.id },
  });
  assert(!!tenantStillThere, "tenant data retained after trial expiry");

  console.log("PASS: Configurable trial period verified");
  console.log("  Trial length from PlatformSetting (DB), not hard-coded call sites");
  console.log("  trialStartsAt / trialEndsAt stored per tenant");
  console.log("  Expiry retains data and blocks publishing");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
