import { prisma } from "@/lib/db";
import {
  normalizeThemeTokens,
  parseNavigationItems,
  type PublicSiteBundle,
} from "@/lib/tenant/public-site-utils";

export type { PublicNavItem, PublicSiteBundle } from "@/lib/tenant/public-site-utils";
export {
  buildPublicMetadata,
  normalizeThemeTokens,
  parseNavigationItems,
  shouldPrependSiteNavbar,
  themeTokensToCssVars,
} from "@/lib/tenant/public-site-utils";

/** Load public website SEO, theme tokens, and main navigation for a tenant. */
export async function getPublicSiteBundle(
  tenantId: string,
): Promise<PublicSiteBundle | null> {
  const website = await prisma.website.findUnique({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      seoTitle: true,
      seoDescription: true,
      faviconUrl: true,
      ogImageUrl: true,
      canonicalUrl: true,
      robotsIndex: true,
      theme: { select: { tokens: true } },
      navigation: {
        where: { key: "main" },
        select: { items: true },
        take: 1,
      },
    },
  });

  if (!website) return null;

  return {
    website: {
      id: website.id,
      name: website.name,
      seoTitle: website.seoTitle,
      seoDescription: website.seoDescription,
      faviconUrl: website.faviconUrl,
      ogImageUrl: website.ogImageUrl,
      canonicalUrl: website.canonicalUrl,
      robotsIndex: website.robotsIndex,
    },
    themeTokens: normalizeThemeTokens(website.theme?.tokens),
    navigationItems: parseNavigationItems(website.navigation[0]?.items),
  };
}
