"use client";

import { useMemo, useState } from "react";

type EventLike = {
  id: string;
  title: string;
  startsAt: string | null;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function dayKey(value: Date) {
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2";

export function EventMonthCalendar({ events }: { events: EventLike[] }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(today);

  const cells = monthCells(cursor.getFullYear(), cursor.getMonth());
  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      if (!event.startsAt) continue;
      const date = new Date(event.startsAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = dayKey(date);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [events]);

  const selectedEvents = events.filter((event) => {
    if (!event.startsAt) return false;
    const date = new Date(event.startsAt);
    return !Number.isNaN(date.getTime()) && sameDay(date, selected);
  });

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          className={`rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 ${focusClass}`}
        >
          Prev
        </button>
        <h2 className="text-center text-base font-semibold text-zinc-950 sm:text-lg">
          {monthLabel}
        </h2>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          className={`rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 ${focusClass}`}
        >
          Next
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((label) => (
          <p
            key={label}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
          >
            {label}
          </p>
        ))}
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-12" />;
          }
          const isToday = sameDay(date, today);
          const isSelected = sameDay(date, selected);
          const count = counts.get(dayKey(date)) ?? 0;
          return (
            <button
              type="button"
              key={date.toISOString()}
              onClick={() => setSelected(startOfDay(date))}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              className={`min-h-12 rounded-lg border px-1 py-1.5 text-center text-sm ${focusClass} ${
                isSelected
                  ? "border-violet-600 bg-violet-600 text-white"
                  : isToday
                    ? "border-violet-600 bg-violet-100 font-bold text-violet-950 ring-2 ring-violet-500"
                    : "border-transparent text-zinc-800 hover:border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <span className="block leading-none">{date.getDate()}</span>
              {isToday ? (
                <span
                  className={`mt-1 block text-[9px] font-semibold uppercase ${
                    isSelected ? "text-white/80" : "text-violet-700"
                  }`}
                >
                  Today
                </span>
              ) : null}
              {count > 0 ? (
                <span
                  className={`mt-1 block text-[10px] ${
                    isSelected ? "text-white/80" : "text-zinc-500"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-3">
        <p className="text-sm font-medium text-zinc-800">
          {sameDay(selected, today) ? "Today" : selected.toLocaleDateString()} —{" "}
          {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-500">No events on this day.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-zinc-700">
            {selectedEvents.map((event) => (
              <li key={event.id}>{event.title}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
