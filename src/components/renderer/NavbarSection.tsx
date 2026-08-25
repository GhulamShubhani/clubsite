"use client";

import { useState, type CSSProperties } from "react";

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
  mobileMenu,
  style,
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  const shellStyle: CSSProperties = {
    ...style,
    ...(height ? { minHeight: height, height } : {}),
  };

  return (
    <section
      data-section-id={sectionId}
      data-section-type="navbar"
      className={[
        "w-full",
        sticky ? "sticky top-0 z-50" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={shellStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex items-center gap-2 font-semibold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 object-contain" />
          ) : null}
          <span className="text-lg">{brand}</span>
        </a>

        {mobileMenu ? (
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-current/30 px-3 py-1.5 text-sm sm:hidden"
            aria-expanded={open}
            aria-controls={`${sectionId}-nav`}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        ) : null}

        <nav
          id={`${sectionId}-nav`}
          className={[
            "flex w-full flex-col gap-3 text-sm sm:w-auto sm:flex-row sm:items-center sm:gap-4",
            mobileMenu ? (open ? "flex" : "hidden sm:flex") : "flex",
          ].join(" ")}
        >
          {links.map((link, i) => (
            <a
              key={`${link.label}-${i}`}
              href={link.href ?? "#"}
              className="hover:underline"
            >
              {link.label ?? "Link"}
            </a>
          ))}
          {ctaLabel ? (
            <a
              href={ctaHref ?? "#"}
              className="inline-flex rounded-md bg-white/15 px-3 py-1.5 font-medium hover:bg-white/25"
            >
              {ctaLabel}
            </a>
          ) : null}
        </nav>
      </div>
    </section>
  );
}
