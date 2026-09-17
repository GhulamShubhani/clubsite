"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ClubManagementNav } from "@/components/admin/ClubManagementNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/pages", label: "Builder" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/website", label: "Website" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/domains", label: "Domains" },
  { href: "/admin/account", label: "Account" },
] as const;

type Props = {
  tenantName: string;
  tenantSlug: string;
  publicUrl: string;
  children: ReactNode;
};

export function AdminShell({
  tenantName,
  tenantSlug,
  publicUrl,
  children,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex min-h-full bg-zinc-50 text-zinc-900">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-100 md:flex">
        <AdminNav tenantName={tenantName} tenantSlug={tenantSlug} publicUrl={publicUrl} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,88vw)] flex-col bg-zinc-100 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">Menu</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800"
              >
                Close
              </button>
            </div>
            <AdminNav tenantName={tenantName} tenantSlug={tenantSlug} publicUrl={publicUrl} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800"
            aria-expanded={open}
            aria-label="Open admin menu"
          >
            Menu
          </button>
          <p className="min-w-0 truncate text-sm font-semibold text-zinc-900">
            {tenantName}
          </p>
        </header>
        <main className="min-w-0 flex-1 overflow-x-auto overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNav({
  tenantName,
  tenantSlug,
  publicUrl,
}: {
  tenantName: string;
  tenantSlug: string;
  publicUrl: string;
}) {
  return (
    <>
      <div className="border-b border-zinc-200 px-4 py-4">
        <Link
          href="/admin"
          className="cursor-pointer text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-800"
        >
          Admin
        </Link>
        <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
          {tenantName}
        </p>
        {tenantSlug ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block cursor-pointer truncate text-xs text-emerald-700 underline hover:text-emerald-900"
            title="Open live website"
          >
            Open website
          </a>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={`${item.label}-${item.href}`}>
              <Link
                href={item.href}
                className="block cursor-pointer rounded-md px-3 py-2 text-base text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 md:py-1.5 md:text-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <ClubManagementNav />
          </li>
        </ul>
      </nav>
      <div className="border-t border-zinc-200 px-2 py-3">
        <LogoutButton />
      </div>
    </>
  );
}
