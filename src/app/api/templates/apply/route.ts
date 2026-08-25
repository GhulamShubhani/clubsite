import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess } from "@/lib/tenant/access";
import { applyTemplateToTenant } from "@/lib/templates/apply";

const applySchema = z.object({
  templateKey: z.string().min(1).max(80),
});

/** Apply a template to the caller's tenant website. Requires EDITOR+. */
export async function POST(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const body = applySchema.parse(await request.json());

    const result = await applyTemplateToTenant(
      ctx.tenant.id,
      body.templateKey,
      ctx.user.id,
    );

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
