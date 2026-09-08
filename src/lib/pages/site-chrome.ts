import { prisma } from "@/lib/db";
import type { PageContent, PageSection } from "@/lib/page-schema";
import { getPublishedPageByPath } from "@/lib/pages/versions";
import type { PublicNavItem } from "@/lib/tenant/public-site-utils";

export function withoutChromeSections(sections: PageSection[] | undefined) {
  return (sections ?? []).filter(
    (section) => section.type !== "navbar" && section.type !== "footer",
  );
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function withLinks(section: PageSection, items: PublicNavItem[]): PageSection {
  return {
    ...section,
    props: {
      ...section.props,
      links: items,
    },
  };
}

/** Menu built from published pages so new pages appear after Publish. */
export async function getPublishedNavItems(
  tenantId: string,
): Promise<PublicNavItem[]> {
  const pages = await prisma.page.findMany({
    where: { tenantId, status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    select: { title: true, path: true },
  });
  return pages.map((page) => ({
    label: page.title,
    href: normalizePath(page.path),
  }));
}

export function mergeNavItems(
  explicit: PublicNavItem[],
  published: PublicNavItem[],
): PublicNavItem[] {
  if (explicit.length === 0) return published;
  const seen = new Set(explicit.map((item) => normalizePath(item.href)));
  const extra = published.filter((item) => !seen.has(normalizePath(item.href)));
  return [...explicit, ...extra];
}

export type SiteChrome = {
  navbar?: PageSection;
  footer?: PageSection;
};

/** Navbar + footer come from the published Home page, reused on every page. */
export async function getSiteChrome(
  tenantId: string,
  navItems: PublicNavItem[],
): Promise<SiteChrome> {
  const home = await getPublishedPageByPath(tenantId, "/");
  const sections = ((home?.published.content ?? { sections: [] }) as PageContent)
    .sections ?? [];
  const navbar = sections.find((section) => section.type === "navbar");
  const footer = sections.find((section) => section.type === "footer");
  return {
    navbar: navbar ? withLinks(navbar, navItems) : undefined,
    footer: footer ? withLinks(footer, navItems) : undefined,
  };
}
