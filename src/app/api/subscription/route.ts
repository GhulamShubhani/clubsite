import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { getPlan, isPlanKey, PLANS, PLAN_KEYS } from "@/lib/billing/plans";
import { AppError } from "@/lib/errors";
import { requireTenantAccess } from "@/lib/tenant/access";
import { getTenantTrial } from "@/lib/trial";

const patchSchema = z.object({
  planKey: z.string().refine(isPlanKey, "Invalid plan"),
});

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const [subscription, trial] = await Promise.all([
      prisma.subscription.findUnique({
        where: { tenantId: ctx.tenant.id },
      }),
      getTenantTrial(prisma, ctx.tenant.id),
    ]);

    const plans = PLAN_KEYS.map((key) => ({ key, ...PLANS[key] }));

    return jsonOk({
      plans,
      current: subscription,
      subscription,
      trial,
      tenant: ctx.tenant,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * MVP plan switch — no payment gateway. OWNER sets planKey; limits come from catalog.
 * Trial status is preserved when selecting the trial plan; otherwise ACTIVE.
 */
export async function PATCH(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "OWNER" });
    const body = patchSchema.parse(await request.json());
    const plan = getPlan(body.planKey);

    const existing = await prisma.subscription.findUnique({
      where: { tenantId: ctx.tenant.id },
    });
    if (!existing) {
      throw new AppError("Subscription not found", 404, "NOT_FOUND");
    }

    const subscription = await prisma.subscription.update({
      where: { tenantId: ctx.tenant.id },
      data: {
        planKey: body.planKey,
        status: body.planKey === "trial" ? "TRIAL" : "ACTIVE",
        pageLimit: plan.pageLimit,
        storageMbLimit: plan.storageMbLimit,
        startsAt: body.planKey === "trial" ? existing.startsAt : new Date(),
      },
    });

    await writeAudit({
      tenantId: ctx.tenant.id,
      userId: ctx.user.id,
      action: "subscription.plan_changed",
      meta: { planKey: body.planKey },
    });

    return jsonOk({ subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
