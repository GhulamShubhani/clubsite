import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { getPublishedPageByPath } from "@/lib/pages/versions";
import { withoutChromeSections } from "@/lib/pages/site-chrome";
import { loadPublicShell } from "@/lib/pages/load-public-shell";
import type { PageContent } from "@/lib/page-schema";
import { PageRenderer } from "@/components/renderer/PageRenderer";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { StructuredData } from "@/components/seo/StructuredData";
import { PublicSiteProvider } from "@/components/public/PublicSiteContext";
import { PublicSiteShell } from "@/components/public/PublicSiteShell";
import {
  buildPublicMetadata,
  getPublicSiteBundle,
} from "@/lib/tenant/public-site";

type Props = { params: Promise<{ path?: string[] }> };

function pathFromSegments(segments?: string[]) {
  return !segments || segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path: segments } = await params;
  const path = pathFromSegments(segments);
  const h = await headers();
  const resolution = await resolveTenantFromHost(h.get("host"));

  if (resolution.kind !== "tenant") {
    return { title: "Not found" };
  }

  const bundle = await getPublicSiteBundle(resolution.tenant.id);
  if (!bundle) {
    return { title: resolution.tenant.name };
  }

  const published = await getPublishedPageByPath(resolution.tenant.id, path);
  if (!published) {
    return { title: "Not found" };
  }

  return buildPublicMetadata(bundle, published.page);
}

/**
 * Public club pages — published content only.
 * Tenant comes from hostname; path is the page URL (not a tenant id).
 */
export default async function PublicCatchAllPage({ params }: Props) {
  const { path: segments } = await params;
  const h = await headers();
  const host = h.get("host");
  const resolution = await resolveTenantFromHost(host);

  if (resolution.kind !== "tenant") {
    notFound();
  }

  const path = pathFromSegments(segments);
  const siteUrl = `${h.get("x-forwarded-proto") ?? "https"}://${host ?? ""}`;

  const [{ bundle, navItems, chrome }, published] = await Promise.all([
    loadPublicShell(resolution.tenant.id),
    getPublishedPageByPath(resolution.tenant.id, path),
  ]);

  if (!published) {
    notFound();
  }

  const content = (published.published.content ?? {
    sections: [],
  }) as PageContent;
  const sections = withoutChromeSections(content.sections);

  return (
    <PublicSiteProvider basePath="" tenantSlug={resolution.tenant.slug}>
      <PublicSiteShell
        brand={bundle?.website.name ?? resolution.tenant.name}
        navItems={navItems}
        navbar={chrome.navbar}
        footer={chrome.footer}
        themeTokens={bundle?.themeTokens}
        googleAnalyticsId={bundle?.website.googleAnalyticsId}
      >
        {bundle ? (
          <StructuredData
            name={bundle.website.name}
            description={bundle.website.seoDescription}
            url={bundle.website.canonicalUrl ?? siteUrl}
            pageTitle={published.page.seoTitle ?? published.page.title}
            pagePath={path}
            logoUrl={bundle.website.faviconUrl}
          />
        ) : null}
        <TrackPageView path={path} />
        <PageRenderer content={{ sections }} />
      </PublicSiteShell>
    </PublicSiteProvider>
  );
}
