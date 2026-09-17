import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireTenantAccess } from "@/lib/tenant/access";
import { UnauthorizedError } from "@/lib/errors";
import { getClubPublicUrl } from "@/lib/tenant/public-url";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let tenantName = "Club workspace";
  let tenantSlug = "";
  let publicUrl = "";
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    tenantName = ctx.tenant.name;
    tenantSlug = ctx.tenant.slug;
    publicUrl = getClubPublicUrl(ctx.tenant.slug);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <AdminShell
      tenantName={tenantName}
      tenantSlug={tenantSlug}
      publicUrl={publicUrl}
    >
      {children}
    </AdminShell>
  );
}
