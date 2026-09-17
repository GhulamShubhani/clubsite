import type { ReactNode } from "react";
import type { PageSection } from "@/lib/page-schema";
import type { PublicNavItem } from "@/lib/tenant/public-site-utils";
import { themeTokensToCssVars } from "@/lib/tenant/public-site-utils";
import { SiteNavbar } from "@/components/renderer/SiteNavbar";
import { SectionRenderer } from "@/components/renderer/SectionRenderer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteLink } from "./SiteLink";

type Props = {
  brand: string;
  navItems: PublicNavItem[];
  navbar?: PageSection;
  footer?: PageSection;
  themeTokens?: Record<string, unknown>;
  googleAnalyticsId?: string | null;
  children: ReactNode;
};

function FallbackFooter({
  brand,
  items,
}: {
  brand: string;
  items: PublicNavItem[];
}) {
  return (
    <footer className="mt-auto border-t border-[var(--color-border,#e4e4e7)] bg-[var(--color-surface,#18181b)] px-4 py-8 text-[var(--color-muted,#a1a1aa)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="font-semibold text-[var(--color-text,#fafafa)]">{brand}</p>
        {items.length > 0 ? (
          <nav className="flex flex-wrap gap-4 text-sm">
            {items.map((item) => (
              <SiteLink key={`${item.label}-${item.href}`} href={item.href}>
                {item.label}
              </SiteLink>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}

export function PublicSiteShell({
  brand,
  navItems,
  navbar,
  footer,
  themeTokens,
  googleAnalyticsId,
  children,
}: Props) {
  return (
    <div
      className="site-theme flex min-h-full w-full flex-col"
      style={themeTokens ? themeTokensToCssVars(themeTokens) : undefined}
    >
      <GoogleAnalytics measurementId={googleAnalyticsId} />
      {navbar ? (
        <SectionRenderer section={navbar} />
      ) : (
        <SiteNavbar brand={brand} items={navItems} />
      )}
      <div className="flex-1">{children}</div>
      {footer ? (
        <SectionRenderer section={footer} />
      ) : (
        <FallbackFooter brand={brand} items={navItems} />
      )}
    </div>
  );
}
