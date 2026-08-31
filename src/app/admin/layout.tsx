import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireTenantAccess } from "@/lib/tenant/access";
import { UnauthorizedError } from "@/lib/errors";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getClubPublicUrl } from "@/lib/tenant/public-url";

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
  { href: "/admin/domains", label: "Domains" },
  { href: "/admin/account", label: "Account" },
] as const;

const CLUB_MANAGEMENT_NAV = [
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/tournaments", label: "Tournaments" },
  { href: "/admin/matches", label: "Matches" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/streams", label: "Streams" },
  { href: "/admin/leaderboards", label: "Leaderboards" },
  { href: "/admin/subscription", label: "Subscription" },
  { href: "/admin/members", label: "Team members" },
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
    <div className="flex min-h-full bg-zinc-50 text-zinc-900">
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-100">
        <div className="border-b border-zinc-200 px-4 py-4">
          <Link
            href="/admin"
            className="cursor-pointer text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-800"
          >
            Admin
          </Link>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
            {tenantName}
          </p>
          {tenantSlug ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block cursor-pointer truncate text-xs text-emerald-700 underline hover:text-emerald-900"
              title="Open live website"
            >
              Open website
            </a>
          ) : null}
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <Link
                  href={item.href}
                  className="block cursor-pointer rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 [&::-webkit-details-marker]:hidden">
                  <span>Club management</span>
                  <span className="text-base leading-none transition-transform group-open:rotate-180">
                   ⌄
                  </span>
                </summary>
                <ul className="mt-1 space-y-0.5 border-l border-zinc-300 pl-2">
                  {CLUB_MANAGEMENT_NAV.map((item) => (
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
              </details>
            </li>
          </ul>
        </nav>
        <div className="border-t border-zinc-200 px-2 py-3">
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
