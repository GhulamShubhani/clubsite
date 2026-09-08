import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPageByPath } from "@/lib/pages/versions";
import { withoutChromeSections } from "@/lib/pages/site-chrome";
import type { PageContent } from "@/lib/page-schema";
import { PageRenderer } from "@/components/renderer/PageRenderer";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { buildPublicMetadata, getPublicSiteBundle } from "@/lib/tenant/public-site";
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

  const published = await getPublishedPageByPath(tenant.id, pagePath);
  if (!published) {
    notFound();
  }

  const content = (published.published.content ?? {
    sections: [],
  }) as PageContent;
  const sections = withoutChromeSections(content.sections);

  return (
    <>
      <TrackPageView path={pagePath} />
      <PageRenderer content={{ sections }} />
    </>
  );
}
