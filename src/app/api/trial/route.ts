import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess } from "@/lib/tenant/access";
import {
  getTenantTrial,
  setDefaultTrialMinutes,
} from "@/lib/trial";

/**
 * Returns the authenticated club's trial window from the database.
 */
export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const trial = await getTenantTrial(prisma, ctx.tenant.id);

    return jsonOk({
      tenantSlug: ctx.tenant.slug,
      trial,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const updateDefaultSchema = z.object({
  /** Platform default for NEW trials only (minutes). Existing clubs keep their dates. */
  defaultTrialMinutes: z.number().int().min(1).max(525600),
});

/**
 * Updates the platform default trial duration stored in PlatformSetting.
 * Does not rewrite existing subscription trialStartsAt / trialEndsAt.
 */
export async function PATCH(request: Request) {
  try {
    // MVP: any authenticated OWNER can adjust for local/dev platform ops.
    // Later: restrict to platform super-admin.
    await requireTenantAccess({ minRole: "OWNER" });
    const body = updateDefaultSchema.parse(await request.json());
    const setting = await setDefaultTrialMinutes(
      prisma,
      body.defaultTrialMinutes,
    );
    return jsonOk({ setting });
  } catch (error) {
    return handleApiError(error);
  }
}
