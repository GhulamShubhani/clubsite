"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/admin/teams", label: "Teams", icon: "◆", accent: "from-sky-500 to-blue-600" },
  { href: "/admin/players", label: "Players", icon: "♟", accent: "from-emerald-500 to-teal-600" },
  { href: "/admin/tournaments", label: "Tournaments", icon: "♛", accent: "from-amber-500 to-orange-600" },
  { href: "/admin/matches", label: "Matches", icon: "⚔", accent: "from-rose-500 to-red-600" },
  { href: "/admin/events", label: "Events", icon: "✦", accent: "from-violet-500 to-purple-600" },
  { href: "/admin/sponsors", label: "Sponsors", icon: "◎", accent: "from-fuchsia-500 to-pink-600" },
  { href: "/admin/streams", label: "Streams", icon: "▶", accent: "from-red-500 to-rose-600" },
  { href: "/admin/leaderboards", label: "Leaderboards", icon: "▲", accent: "from-lime-500 to-green-600" },
  { href: "/admin/subscription", label: "Subscription", icon: "★", accent: "from-indigo-500 to-blue-600" },
  { href: "/admin/members", label: "Team members", icon: "◉", accent: "from-zinc-500 to-zinc-700" },
] as const;

export function ClubManagementNav() {
  const pathname = usePathname();
  const isActiveGroup = ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-3 py-3 text-left transition ${
          isActiveGroup
            ? "bg-linear-to-r from-violet-600 to-indigo-600 text-white"
            : "bg-zinc-50 text-zinc-800 hover:bg-zinc-100"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            isActiveGroup
              ? "bg-white/20 text-white"
              : "bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-sm"
          }`}
        >
          ⌘
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[0.16em]">
            Club management
          </span>
          <span
            className={`mt-0.5 block text-[10px] ${
              isActiveGroup ? "text-violet-100" : "text-zinc-500"
            }`}
          >
            {ITEMS.length} tools · roster & ops
          </span>
        </span>
        <span
          className={`inline-grid h-9 w-9 shrink-0 place-items-center rounded-full border shadow-sm transition duration-200 ${
            isActiveGroup
              ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
              : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:text-violet-700"
          } ${open ? "rotate-180" : "rotate-0"}`}
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1 p-2">
            {ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${
                      active
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-sm bg-linear-to-br ${item.accent} ${
                        active ? "ring-2 ring-white/30" : "opacity-90 group-hover:opacity-100"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                    {active ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="ml-auto text-[10px] text-zinc-400 opacity-0 transition group-hover:opacity-100">
                        →
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
