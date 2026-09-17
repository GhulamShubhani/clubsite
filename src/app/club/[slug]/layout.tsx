import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { resolveTenantFromSlug } from "@/lib/tenant/resolve-by-slug";
import { loadPublicShell } from "@/lib/pages/load-public-shell";
import { PublicSiteProvider } from "@/components/public/PublicSiteContext";
import { PublicSiteShell } from "@/components/public/PublicSiteShell";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ClubPublicLayout({ children, params }: Props) {
  const { slug } = await params;
  let tenant;
  try {
    tenant = await resolveTenantFromSlug(slug);
  } catch {
    notFound();
  }

  const { bundle, navItems, chrome } = await loadPublicShell(tenant.id);

  return (
    <PublicSiteProvider
      basePath={`/club/${encodeURIComponent(slug)}`}
      tenantSlug={slug}
    >
      <PublicSiteShell
        brand={bundle?.website.name ?? tenant.name}
        navItems={navItems}
        navbar={chrome.navbar}
        footer={chrome.footer}
        themeTokens={bundle?.themeTokens}
        googleAnalyticsId={bundle?.website.googleAnalyticsId}
      >
        {children}
      </PublicSiteShell>
    </PublicSiteProvider>
  );
}
