"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { RenderDevice } from "@/components/renderer/PageRenderer";
import { site } from "@/components/renderer/site-classes";

type LinkItem = { label?: string; href?: string };

type Props = {
  sectionId: string;
  brand: string;
  logoUrl?: string;
  links: LinkItem[];
  ctaLabel?: string;
  ctaHref?: string;
  sticky?: boolean;
  height?: string;
  mobileMenu?: boolean;
  device?: RenderDevice;
  style?: CSSProperties;
  className?: string;
};

export function NavbarSection({
  sectionId,
  brand,
  logoUrl,
  links,
  ctaLabel,
  ctaHref,
  sticky,
  height,
  mobileMenu = true,
  device = "desktop",
  style,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const isCompact = device === "mobile" || device === "tablet";

  useEffect(() => {
    setOpen(false);
  }, [device]);

  const shellStyle: CSSProperties = {
    ...style,
    ...(height ? { minHeight: height } : {}),
  };

  const showMenuButton = mobileMenu || isCompact;

  const navClass = isCompact
    ? open
      ? "flex w-full flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm"
      : "hidden"
    : [
        "flex w-full flex-col gap-3 text-sm sm:w-auto sm:flex-row sm:items-center sm:gap-5",
        mobileMenu ? (open ? "flex" : "hidden sm:flex") : "flex",
      ].join(" ");

  return (
    <section
      data-section-id={sectionId}
      data-section-type="navbar"
      className={[
        "w-full overflow-visible backdrop-blur-sm",
        sticky ? "sticky top-0 z-50" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={shellStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold text-[var(--color-text)] [font-family:var(--font-heading,var(--font-family))]"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain" />
          ) : null}
          <span className="truncate text-lg">{brand}</span>
        </a>

        {showMenuButton ? (
          <button
            type="button"
            className={
              isCompact
                ? "inline-flex shrink-0 items-center rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm"
                : "inline-flex shrink-0 items-center rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm sm:hidden"
            }
            aria-expanded={open}
            aria-controls={`${sectionId}-nav`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            {open ? "Close" : "Menu"}
          </button>
        ) : null}

        {!isCompact ? (
          <nav id={`${sectionId}-nav`} className={navClass}>
            {links.map((link, i) => (
              <a key={`${link.label}-${i}`} href={link.href ?? "#"} className={site.link}>
                {link.label ?? "Link"}
              </a>
            ))}
            {ctaLabel ? (
              <a href={ctaHref ?? "#"} className={site.navCta}>
                {ctaLabel}
              </a>
            ) : null}
          </nav>
        ) : null}
      </div>

      {isCompact ? (
        <nav id={`${sectionId}-nav`} className={navClass}>
          {links.map((link, i) => (
            <a
              key={`${link.label}-${i}`}
              href={link.href ?? "#"}
              className={site.link}
              onClick={() => setOpen(false)}
            >
              {link.label ?? "Link"}
            </a>
          ))}
          {ctaLabel ? (
            <a
              href={ctaHref ?? "#"}
              className={`${site.navCta} w-fit`}
              onClick={() => setOpen(false)}
            >
              {ctaLabel}
            </a>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
