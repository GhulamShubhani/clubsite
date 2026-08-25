import Link from "next/link";
import { requireTenantAccess } from "@/lib/tenant/access";
import { prisma } from "@/lib/db";
import { getTenantTrial } from "@/lib/trial";
import { listPagesForTenant } from "@/lib/tenant/data";
import { LiveSiteCard } from "@/components/admin/LiveSiteCard";
import { getClubPublicUrl } from "@/lib/tenant/public-url";

export default async function AdminDashboardPage() {
  const ctx = await requireTenantAccess({ minRole: "VIEWER" });
  const trial = await getTenantTrial(prisma, ctx.tenant.id);
  const pages = await listPagesForTenant(ctx);
  const recent = pages.slice(0, 8);
  const publicUrl = getClubPublicUrl(ctx.tenant.slug);
  const firstPage = pages[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {ctx.tenant.name} · {ctx.user.email} · {ctx.membership.role}
        </p>
      </div>

      <LiveSiteCard
        clubName={ctx.tenant.name}
        slug={ctx.tenant.slug}
        publicUrl={publicUrl}
      />

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">Trial status</h2>
        {trial ? (
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            <li>Status: {trial.status}</li>
            <li>Ends: {trial.trialEndsAt.toISOString()}</li>
            <li>
              Publishing:{" "}
              {trial.blocksPublishing ? "blocked (expired)" : "allowed"}
            </li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">No subscription found.</p>
        )}
        {trial?.blocksPublishing && (
          <Link
            href="/admin/subscription"
            className="mt-3 inline-block text-sm text-amber-700 underline"
          >
            Upgrade subscription
          </Link>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium text-zinc-900">Pages</h2>
            <p className="text-sm text-zinc-600">{pages.length} total</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {firstPage && (
              <Link
                href={`/admin/builder/${firstPage.id}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Edit
              </Link>
            )}
            <Link
              href="/admin/pages"
              className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
            >
              Add Page
            </Link>
            {firstPage ? (
              <Link
                href={`/admin/preview/${firstPage.id}`}
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Preview
              </Link>
            ) : (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50"
              >
                Preview
              </a>
            )}
            <Link
              href="/admin/pages"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-white hover:bg-zinc-800"
            >
              Publish
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="font-medium text-zinc-900">Recent pages</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No pages yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-zinc-100 text-sm">
            {recent.map((page) => (
              <li
                key={page.id}
                className="flex items-center justify-between gap-4 py-2"
              >
              <span>
                {page.title}{" "}
                <span className="font-mono text-zinc-400">{page.path}</span>
              </span>
              <span className="flex items-center gap-3 text-zinc-500">
                <span>{page.status}</span>
                <Link
                  href={`/admin/builder/${page.id}`}
                  className="text-zinc-900 underline"
                >
                  Edit
                </Link>
              </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
