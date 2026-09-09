import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { requireTenantAccess, tenantScope } from "@/lib/tenant/access";

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const messages = await prisma.contactSubmission.findMany({
      where: tenantScope(ctx),
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const ctx = await requireTenantAccess({ minRole: "EDITOR" });
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      throw new AppError("Missing id", 400, "VALIDATION");
    }
    await prisma.contactSubmission.deleteMany({
      where: { id, ...tenantScope(ctx) },
    });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
