"use client";

import { SiteLink } from "@/components/public/SiteLink";

type NavItem = { label: string; href: string };

type Props = {
  brand?: string;
  items: NavItem[];
};

/** Simple header prepended when page content has no navbar section. */
export function SiteNavbar({ brand = "Club", items }: Props) {
  if (items.length === 0) return null;
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-[var(--color-bg,#fff)] text-[var(--color-text,#18181b)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <SiteLink href="/" className="text-lg font-semibold">
          {brand}
        </SiteLink>
        <nav className="flex flex-wrap gap-4 text-sm">
          {items.map((item) => (
            <SiteLink
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="hover:underline"
            >
              {item.label}
            </SiteLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
