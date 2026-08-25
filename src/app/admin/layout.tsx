import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireTenantAccess } from "@/lib/tenant/access";
import { UnauthorizedError } from "@/lib/errors";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/pages", label: "Builder" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/website", label: "Website" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/streams", label: "Streams" },
  { href: "/admin/leaderboards", label: "Leaderboards" },
  { href: "/admin/subscription", label: "Subscription" },
  { href: "/admin/domains", label: "Domains" },
  { href: "/admin/members", label: "Team members" },
  { href: "/admin/account", label: "Account" },
] as const;

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
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    tenantName = ctx.tenant.name;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="flex min-h-full bg-zinc-50 text-zinc-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-100">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Admin
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
            {tenantName}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
