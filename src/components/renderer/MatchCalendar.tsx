"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { usePublicSite } from "@/components/public/PublicSiteContext";

export type CalendarMatch = {
  title?: string;
  game?: string;
  startsAt?: string;
  time?: string;
  relativeDay?: number | string;
};

type Resolved = {
  title: string;
  game: string;
  date: Date;
  dayDiff: number;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseTime(time: string | undefined): [number, number] {
  const raw = String(time ?? "19:00").trim();
  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?/);
  if (!match) return [19, 0];
  return [Number(match[1]) % 24, Number(match[2] ?? 0)];
}

function asDayOffset(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Math.trunc(Number(value));
  }
  return null;
}

function resolveMatch(item: CalendarMatch, today: Date): Resolved | null {
  const title = String(item.title ?? "Match").trim() || "Match";
  const game = String(item.game ?? "").trim();
  const offset = asDayOffset(item.relativeDay);
  if (offset !== null) {
    const day = startOfDay(today);
    day.setDate(day.getDate() + offset);
    const [hours, minutes] = parseTime(item.time);
    day.setHours(hours, minutes, 0, 0);
    return { title, game, date: day, dayDiff: offset };
  }

  const iso = String(item.startsAt ?? "").trim();
  const parsed = iso ? new Date(iso) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  const diff = Math.round(
    (startOfDay(parsed).getTime() - startOfDay(today).getTime()) / 86_400_000,
  );
  return { title, game, date: parsed, dayDiff: diff };
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short" });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatSelected(date: Date, today: Date) {
  if (sameDay(date, today)) {
    return `Today · ${date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  heading?: string;
  description?: string;
  items?: CalendarMatch[];
};

export function MatchCalendar({
  heading = "Match calendar",
  description,
  items = [],
}: Props) {
  const { tenantSlug } = usePublicSite();
  const pathname = usePathname() ?? "";
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [showMonth, setShowMonth] = useState(false);
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [liveItems, setLiveItems] = useState<CalendarMatch[] | null>(null);
  const [liveSource, setLiveSource] = useState<"admin" | "public" | null>(null);

  useEffect(() => {
    const isTemplatePreview = pathname.includes("/admin/templates/preview");
    if (isTemplatePreview) return;

    let cancelled = false;

    async function load() {
      const urls: Array<{ href: string; source: "public" | "admin" }> = [];
      if (tenantSlug) {
        urls.push({
          href: `/api/public/matches?slug=${encodeURIComponent(tenantSlug)}`,
          source: "public",
        });
      } else {
        urls.push({ href: "/api/public/matches", source: "public" });
      }
      if (pathname.startsWith("/admin")) {
        urls.push({ href: "/api/gaming/matches", source: "admin" });
      }

      for (const url of urls) {
        try {
          const res = await fetch(url.href);
          if (!res.ok) continue;
          const data = (await res.json()) as {
            items?: CalendarMatch[];
            matches?: Array<{
              title?: string;
              game?: string | null;
              startsAt?: string | null;
              teamAName?: string | null;
              teamBName?: string | null;
            }>;
          };
          const mapped: CalendarMatch[] = Array.isArray(data.items)
            ? data.items
            : (data.matches ?? []).map((match) => ({
                title:
                  match.title ||
                  [match.teamAName, match.teamBName].filter(Boolean).join(" vs ") ||
                  "Match",
                game: match.game ?? "",
                startsAt: match.startsAt ?? "",
              }));
          const usable = mapped.filter((item) => String(item.startsAt ?? "").trim());
          if (!cancelled && usable.length > 0) {
            setLiveItems(usable);
            setLiveSource(url.source);
            return;
          }
        } catch {
          // try next source
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname, tenantSlug]);

  const calendarItems = liveItems && liveItems.length > 0 ? liveItems : items;

  const resolved = useMemo(
    () =>
      calendarItems
        .map((item) => resolveMatch(item, today))
        .filter((row): row is Resolved => row !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [calendarItems, today],
  );

  const stripDays = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3;
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const count = resolved.filter((row) => sameDay(row.date, date)).length;
    return { date, count, offset, isToday: offset === 0 };
  });

  const selectedMatches = resolved.filter((row) => sameDay(row.date, selected));
  const cells = monthCells(monthCursor.getFullYear(), monthCursor.getMonth());

  function selectDay(date: Date) {
    setSelected(startOfDay(date));
  }

  function openMonth(date: Date) {
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowMonth(true);
  }

  return (
    <div>
      {heading ? (
        <h2 className="text-xl font-semibold text-[var(--color-text)]">{heading}</h2>
      ) : null}
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      ) : null}
      {liveSource === "admin" ? (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Showing live matches from Club management → Matches.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          onClick={() => {
            if (showMonth) {
              setShowMonth(false);
              return;
            }
            openMonth(selected);
          }}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-primary,#6366f1)]"
        >
          {showMonth ? "Hide month calendar" : "Full month & year"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {stripDays.map((day) => {
          const isSelected = sameDay(day.date, selected);
          return (
            <button
              type="button"
              key={day.offset}
              onClick={() => {
                selectDay(day.date);
                setShowMonth(false);
              }}
              className={`rounded-xl border px-1 py-2 text-center transition ${
                isSelected
                  ? "border-[var(--color-primary,#6366f1)] bg-[var(--color-primary,#6366f1)] text-white"
                  : day.isToday
                    ? "border-[var(--color-primary,#6366f1)] bg-[var(--color-surface)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-primary,#6366f1)]"
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  isSelected ? "text-white/80" : "text-[var(--color-muted)]"
                }`}
              >
                {day.isToday ? "Today" : formatWeekday(day.date)}
              </p>
              <p
                className={`mt-1 text-lg font-bold leading-none ${
                  isSelected ? "text-white" : "text-[var(--color-text)]"
                }`}
              >
                {day.date.getDate()}
              </p>
              <p
                className={`mt-1 text-[10px] font-medium ${
                  isSelected ? "text-white/80" : "text-[var(--color-muted)]"
                }`}
              >
                {formatMonth(day.date)}
              </p>
              <p
                className={`mt-1 text-[10px] ${
                  isSelected ? "text-white/80" : "text-[var(--color-muted)]"
                }`}
              >
                {day.count > 0 ? `${day.count}` : "—"}
              </p>
            </button>
          );
        })}
      </div>

      {showMonth ? (
        <section
          id="match-calendar-month"
          className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setMonthCursor(
                  new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1),
                )
              }
              className="rounded-md px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background,#00000014)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6366f1)]"
            >
              ‹
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {formatMonthYear(monthCursor)}
              </p>
              <div className="mt-1 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(new Date(monthCursor.getFullYear() - 1, monthCursor.getMonth(), 1))
                  }
                  className="text-[11px] text-[var(--color-muted)] hover:underline"
                >
                  {monthCursor.getFullYear() - 1}
                </button>
                <span className="text-[11px] font-semibold text-[var(--color-text)]">
                  {monthCursor.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(new Date(monthCursor.getFullYear() + 1, monthCursor.getMonth(), 1))
                  }
                  className="text-[11px] text-[var(--color-muted)] hover:underline"
                >
                  {monthCursor.getFullYear() + 1}
                </button>
              </div>
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonthCursor(
                  new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1),
                )
              }
              className="rounded-md px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background,#00000014)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6366f1)]"
            >
              ›
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((label) => (
              <p
                key={label}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]"
              >
                {label}
              </p>
            ))}
            {cells.map((date, i) => {
              if (!date) {
                return <div key={`empty-${i}`} />;
              }
              const count = resolved.filter((row) => sameDay(row.date, date)).length;
              const isToday = sameDay(date, today);
              const isSelected = sameDay(date, selected);
              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => selectDay(date)}
                  className={`min-h-12 rounded-lg border px-1 py-1.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6366f1)] ${
                    isSelected
                      ? "border-[var(--color-primary,#6366f1)] bg-[var(--color-primary,#6366f1)] text-white"
                      : isToday
                        ? "border-[var(--color-primary,#6366f1)] bg-[color-mix(in_srgb,var(--color-primary,#6366f1)_18%,transparent)] font-bold ring-2 ring-[var(--color-primary,#6366f1)]"
                        : "border-transparent hover:border-[var(--color-border)]"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-[var(--color-text)]"}`}>
                    {date.getDate()}
                  </p>
                  <p className={`text-[10px] ${isSelected ? "text-white/80" : "text-[var(--color-muted)]"}`}>
                    {count > 0 ? `${count}` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section id="match-calendar-selection" className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {formatSelected(selected, today)}
        </h3>
        {selectedMatches.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-muted)]">
            No matches on this date.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {selectedMatches.map((row, i) => (
              <li
                key={`${row.title}-${row.date.toISOString()}-${i}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-text)]">{row.title}</p>
                  {row.game ? (
                    <p className="text-sm text-[var(--color-muted)]">{row.game}</p>
                  ) : null}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {formatTime(row.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
