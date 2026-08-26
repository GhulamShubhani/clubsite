"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { RenderDevice } from "@/components/renderer/PageRenderer";

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
  /** Builder preview device — media queries don't shrink with the canvas. */
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

  // Reset open state when switching preview device
  useEffect(() => {
    setOpen(false);
  }, [device]);

  // minHeight only — fixed height clips wrapped/mobile menu onto the white canvas
  const shellStyle: CSSProperties = {
    ...style,
    ...(height ? { minHeight: height } : {}),
  };

  const showMenuButton = mobileMenu || isCompact;

  const navClass = isCompact
    ? open
      ? "flex w-full flex-col gap-3 border-t border-current/15 px-4 py-3 text-sm"
      : "hidden"
    : [
        "flex w-full flex-col gap-3 text-sm sm:w-auto sm:flex-row sm:items-center sm:gap-4",
        mobileMenu ? (open ? "flex" : "hidden sm:flex") : "flex",
      ].join(" ");

  return (
    <section
      data-section-id={sectionId}
      data-section-type="navbar"
      className={[
        "w-full overflow-visible",
        sticky ? "sticky top-0 z-50" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={shellStyle}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href="/" className="flex min-w-0 items-center gap-2 font-semibold">
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
                ? "inline-flex shrink-0 items-center rounded-md border border-current/30 px-3 py-1.5 text-sm"
                : "inline-flex shrink-0 items-center rounded-md border border-current/30 px-3 py-1.5 text-sm sm:hidden"
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
        ) : null}
      </div>

      {isCompact ? (
        <nav id={`${sectionId}-nav`} className={navClass}>
          {links.map((link, i) => (
            <a
              key={`${link.label}-${i}`}
              href={link.href ?? "#"}
              className="hover:underline"
              onClick={() => setOpen(false)}
            >
              {link.label ?? "Link"}
            </a>
          ))}
          {ctaLabel ? (
            <a
              href={ctaHref ?? "#"}
              className="inline-flex w-fit rounded-md bg-white/15 px-3 py-1.5 font-medium hover:bg-white/25"
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
