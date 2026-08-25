import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { resolveTenantFromSlug } from "@/lib/tenant/resolve-by-slug";

type Props = {
  slug: string;
  pagePath: string;
};

export async function publicClubMetadata({
  slug,
  pagePath,
}: Props): Promise<Metadata> {
  try {
    const tenant = await resolveTenantFromSlug(slug);
    const bundle = await getPublicSiteBundle(tenant.id);
    if (!bundle) {
      return { title: tenant.name };
    }
    const published = await getPublishedPageByPath(tenant.id, pagePath);
    if (!published) {
      return { title: "Not found" };
    }
    return buildPublicMetadata(bundle, published.page);
  } catch {
    return { title: "Not found" };
  }
}

export async function PublicClubPageView({ slug, pagePath }: Props) {
  let tenant;
  try {
    tenant = await resolveTenantFromSlug(slug);
  } catch {
    notFound();
  }

  const [bundle, published] = await Promise.all([
    getPublicSiteBundle(tenant.id),
    getPublishedPageByPath(tenant.id, pagePath),
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
    <main className="min-h-full w-full bg-white">
      <TrackPageView path={pagePath} />
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
