import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { getPublishedPageByPath } from "@/lib/pages/versions";
import type { PageContent } from "@/lib/page-schema";
import { PageRenderer } from "@/components/renderer/PageRenderer";
import { SiteNavbar } from "@/components/renderer/SiteNavbar";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import {
  buildPublicMetadata,
  getPublicSiteBundle,
  shouldPrependSiteNavbar,
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

  const [bundle, published] = await Promise.all([
    getPublicSiteBundle(resolution.tenant.id),
    getPublishedPageByPath(resolution.tenant.id, path),
  ]);

  if (!published) {
    notFound();
  }

  const content = (published.published.content ?? {
    sections: [],
  }) as PageContent;
  const prependNav =
    Boolean(bundle) && shouldPrependSiteNavbar(content.sections);

  return (
    <main className="min-h-full w-full">
      <TrackPageView path={path} />
      {prependNav && bundle ? (
        <SiteNavbar brand={bundle.website.name} items={bundle.navigationItems} />
      ) : null}
      <PageRenderer content={content} themeTokens={bundle?.themeTokens} />
      <p className="mx-auto max-w-4xl px-6 py-4 text-xs text-zinc-400">
        Published · v{published.published.version} · {published.page.title}
      </p>
    </main>
  );
}
