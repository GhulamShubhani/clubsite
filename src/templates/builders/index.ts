import type { PageContent, PageSection } from "@/lib/page-schema";
import type { ThemeTokens } from "../tokens/schema";
import { shellStyles } from "../tokens/css-vars";

export type TemplateNavItem = { label: string; href: string };

export type TemplatePageDef = {
  title: string;
  path: string;
  content: PageContent;
};

export type TemplateDefinition = {
  key: string;
  name: string;
  description: string;
  theme: Record<string, unknown>;
  navigation: TemplateNavItem[];
  pages: TemplatePageDef[];
};

let _seq = 0;
let _theme: ThemeTokens | null = null;

export function resetSeq() {
  _seq = 0;
}

/** Bind theme tokens for styled section shells in the current template build. */
export function beginTemplate(theme: ThemeTokens) {
  resetSeq();
  _theme = theme;
}

function theme(): ThemeTokens {
  if (!_theme) throw new Error("beginTemplate() must be called first");
  return _theme;
}

export function s(
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Omit<PageSection, "id" | "type" | "props">>,
): PageSection {
  _seq += 1;
  return { id: `${type}-${_seq}`, type, props, ...extra };
}

export function page(
  title: string,
  path: string,
  sections: PageSection[],
): TemplatePageDef {
  return { title, path, content: { sections } };
}

export function nav(...items: [string, string][]): TemplateNavItem[] {
  return items.map(([label, href]) => ({ label, href }));
}

function navbar(brand: string, links: TemplateNavItem[], cta?: { label: string; href: string }) {
  const t = theme();
  return s(
    "navbar",
    {
      brand,
      links,
      sticky: true,
      mobileMenu: true,
      ctaLabel: cta?.label,
      ctaHref: cta?.href,
    },
    { styles: shellStyles(t, "navbar") },
  );
}

function footer(brand: string, links: TemplateNavItem[], note: string) {
  const t = theme();
  return s("footer", { brand, links, note }, { styles: shellStyles(t, "footer") });
}

function sectionWrap(sections: PageSection[]): PageSection[] {
  const t = theme();
  return sections.map((sec) => {
    if (["navbar", "footer", "hero", "spacer", "divider"].includes(sec.type)) {
      return sec;
    }
    if (sec.styles && Object.keys(sec.styles).length > 0) return sec;
    return { ...sec, styles: { ...shellStyles(t, "section"), ...(sec.styles ?? {}) } };
  });
}

/** Full home page — cinematic hero, themed sections, footer. */
export function homePage(
  brand: string,
  links: TemplateNavItem[],
  hero: {
    heading: string;
    subheading: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
  },
  mid: PageSection[],
  footerNote: string,
  cta?: { label: string; href: string },
): TemplatePageDef {
  const hasImage = Boolean(hero.imageUrl);
  return page("Home", "/", [
    navbar(brand, links, cta),
    s(
      "hero",
      {
        layout: hasImage ? "full-width-bg" : "gaming-banner",
        heading: hero.heading,
        subheading: hero.subheading,
        description: hero.subheading,
        ctaLabel: hero.ctaLabel ?? "Get Started",
        ctaHref: hero.ctaHref ?? "/contact",
        imageUrl: hero.imageUrl ?? "",
        buttons: [
          {
            label: hero.ctaLabel ?? "Get Started",
            href: hero.ctaHref ?? "/contact",
          },
        ],
      },
      { styles: shellStyles(theme(), "hero") },
    ),
    ...sectionWrap(mid),
    footer(brand, links, footerNote),
  ]);
}

/** Inner page with header band, content, footer. */
export function innerPage(
  title: string,
  path: string,
  brand: string,
  links: TemplateNavItem[],
  header: { heading: string; description?: string },
  sections: PageSection[],
  footerNote?: string,
): TemplatePageDef {
  const t = theme();
  return page(title, path, [
    navbar(brand, links),
    s(
      "header",
      { heading: header.heading, description: header.description ?? "" },
      {
        styles: {
          background: `linear-gradient(180deg, ${t.surface} 0%, ${t.background} 100%)`,
          padding: "3rem 0 2rem",
          borderBottom: `1px solid ${t.border}`,
        },
      },
    ),
    ...sectionWrap(sections),
    footer(brand, links, footerNote ?? `© ${brand}`),
  ]);
}

export function contactBlocks(
  heading = "Get in touch",
  description = "Questions, partnerships, or press — we reply within 24 hours.",
): PageSection[] {
  return [
    s("text", { text: description }),
    s("contact-form", {
      heading,
      description: "Fill out the form and we'll get back to you.",
      submitLabel: "Send message",
    }),
    s("social-links", {
      heading: "Follow us",
      items: [
        { label: "Discord", href: "https://discord.gg/example" },
        { label: "Twitch", href: "https://twitch.tv" },
        { label: "X", href: "https://x.com" },
      ],
    }),
  ];
}

export function galleryBlock(
  heading: string,
  items: { imageUrl: string; caption: string }[],
): PageSection {
  return s("gaming-gallery", { heading, items, variant: "overlay" });
}

export function ctaBlock(
  heading: string,
  body: string,
  buttonLabel: string,
  buttonHref: string,
): PageSection {
  const t = theme();
  return s(
    "registration-cta",
    { heading, body, description: body, buttonLabel, buttonHref },
    { styles: shellStyles(t, "cta") },
  );
}

export function toTemplateConfig(def: TemplateDefinition) {
  return {
    theme: def.theme,
    navigation: def.navigation,
    pages: def.pages,
  };
}
