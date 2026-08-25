"use client";

import { useEffect, useState } from "react";

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function calc(target: Date, now: Date): Parts {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    done: false,
  };
}

type Props = {
  targetDate: string;
  className?: string;
};

export function EventCountdown({ targetDate, className }: Props) {
  const [parts, setParts] = useState<Parts | null>(null);
  const valid = !Number.isNaN(new Date(targetDate).getTime());

  useEffect(() => {
    const target = new Date(targetDate);
    if (Number.isNaN(target.getTime())) return;
    const targetMs = target.getTime();
    const tick = () => setParts(calc(new Date(targetMs), new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  if (!valid) {
    return (
      <p className={className ?? "font-mono text-sm text-zinc-500"}>
        {targetDate || "Date TBD"}
      </p>
    );
  }

  if (!parts) {
    return (
      <p className={className ?? "font-mono text-sm text-zinc-500"}>…</p>
    );
  }

  if (parts.done) {
    return (
      <p className={className ?? "text-lg font-semibold"}>Event started</p>
    );
  }

  const cells = [
    { label: "Days", value: parts.days },
    { label: "Hours", value: parts.hours },
    { label: "Min", value: parts.minutes },
    { label: "Sec", value: parts.seconds },
  ];

  return (
    <div
      className={
        className ??
        "mx-auto flex flex-wrap justify-center gap-3 font-mono tabular-nums"
      }
    >
      {cells.map((c) => (
        <div
          key={c.label}
          className="min-w-[4.5rem] rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-center"
        >
          <div className="text-2xl font-semibold text-zinc-900">
            {String(c.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-500">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
