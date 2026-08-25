import type { CSSProperties } from "react";
import type { Metadata } from "next";

export type PublicNavItem = { label: string; href: string };

export type PublicSiteBundle = {
  website: {
    id: string;
    name: string;
    seoTitle: string | null;
    seoDescription: string | null;
    faviconUrl: string | null;
    ogImageUrl: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean;
  };
  themeTokens: Record<string, unknown>;
  navigationItems: PublicNavItem[];
};

const defaultThemeTokens: Record<string, string> = {
  primary: "#18181b",
  background: "#ffffff",
  text: "#18181b",
  fontFamily: "system-ui, sans-serif",
};

function asStringRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function normalizeThemeTokens(
  raw: unknown,
): Record<string, unknown> {
  const current = asStringRecord(raw);
  return {
    ...defaultThemeTokens,
    ...Object.fromEntries(
      Object.entries(current).filter(([, v]) => typeof v === "string"),
    ),
  };
}

export function parseNavigationItems(raw: unknown): PublicNavItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label = typeof row.label === "string" ? row.label.trim() : "";
      const href = typeof row.href === "string" ? row.href.trim() : "";
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((x): x is PublicNavItem => x !== null);
}

/** Map theme tokens to CSS custom properties for PageRenderer. */
export function themeTokensToCssVars(
  tokens?: Record<string, unknown> | null,
): CSSProperties {
  const t = normalizeThemeTokens(tokens ?? {});
  const primary = String(t.primary ?? defaultThemeTokens.primary);
  const bg = String(t.background ?? defaultThemeTokens.background);
  const text = String(t.text ?? defaultThemeTokens.text);
  const font = String(t.fontFamily ?? defaultThemeTokens.fontFamily);
  return {
    ["--color-primary" as string]: primary,
    ["--color-bg" as string]: bg,
    ["--color-text" as string]: text,
    ["--font-family" as string]: font,
    backgroundColor: bg,
    color: text,
    fontFamily: font,
  };
}

type PageSeo = {
  title?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

/** Build Next.js Metadata from website + optional page SEO overrides. */
export function buildPublicMetadata(
  bundle: PublicSiteBundle,
  page?: PageSeo | null,
): Metadata {
  const title =
    page?.seoTitle ||
    bundle.website.seoTitle ||
    page?.title ||
    bundle.website.name;
  const description =
    page?.seoDescription || bundle.website.seoDescription || undefined;
  const ogImages = bundle.website.ogImageUrl
    ? [{ url: bundle.website.ogImageUrl }]
    : undefined;

  return {
    title,
    description,
    robots: bundle.website.robotsIndex ? undefined : { index: false, follow: false },
    alternates: bundle.website.canonicalUrl
      ? { canonical: bundle.website.canonicalUrl }
      : undefined,
    icons: bundle.website.faviconUrl
      ? { icon: bundle.website.faviconUrl }
      : undefined,
    openGraph: {
      title,
      description,
      images: ogImages,
    },
  };
}

export function shouldPrependSiteNavbar(
  sections: Array<{ type: string }> | undefined,
): boolean {
  const first = sections?.[0];
  return !first || first.type !== "navbar";
}
