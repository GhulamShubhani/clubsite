import { getPublicSiteBundle } from "@/lib/tenant/public-site";
import {
  getPublishedNavItems,
  getSiteChrome,
  type SiteChrome,
} from "@/lib/pages/site-chrome";
import type { PublicNavItem } from "@/lib/tenant/public-site-utils";
import type { PublicSiteBundle } from "@/lib/tenant/public-site-utils";

export async function loadPublicShell(tenantId: string): Promise<{
  bundle: PublicSiteBundle | null;
  navItems: PublicNavItem[];
  chrome: SiteChrome;
}> {
  const [bundle, published] = await Promise.all([
    getPublicSiteBundle(tenantId),
    getPublishedNavItems(tenantId),
  ]);
  const navItems =
    published.length > 0 ? published : (bundle?.navigationItems ?? []);
  const chrome = await getSiteChrome(tenantId, navItems);
  return { bundle, navItems, chrome };
}
