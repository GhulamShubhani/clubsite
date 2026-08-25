"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  uniqueVisitorsApprox: number;
  uniqueDayPathVisitorsApprox: number;
  topPaths: { path: string; count: number }[];
  topReferrers: { value: string; count: number }[];
  devices: { deviceType: string; count: number }[];
  countries: { value: string; count: number }[];
};

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load analytics");
        return;
      }
      setSummary(data.summary);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Analytics</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!summary && !error && (
        <p className="text-sm text-zinc-500">Loading…</p>
      )}
      {summary && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Total views", summary.totalViews],
                ["Last 7 days", summary.viewsLast7Days],
                ["Last 30 days", summary.viewsLast30Days],
                ["Unique (UA)", summary.uniqueVisitorsApprox],
                [
                  "Unique day+path",
                  summary.uniqueDayPathVisitorsApprox,
                ],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <ListSection
            title="Top paths (30 days)"
            rows={summary.topPaths.map((r) => [r.path, r.count] as const)}
          />
          <ListSection
            title="Top referrers"
            rows={summary.topReferrers.map(
              (r) => [r.value, r.count] as const,
            )}
          />
          <ListSection
            title="Devices"
            rows={summary.devices.map(
              (r) => [r.deviceType, r.count] as const,
            )}
          />
          <ListSection
            title="Countries"
            rows={summary.countries.map(
              (r) => [r.value, r.count] as const,
            )}
          />
        </>
      )}
    </div>
  );
}

function ListSection({
  title,
  rows,
}: {
  title: string;
  rows: readonly (readonly [string, number])[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="font-medium text-zinc-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No data yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-zinc-100 text-sm">
          {rows.map(([label, count]) => (
            <li
              key={label}
              className="flex justify-between gap-4 py-2"
            >
              <span className="truncate font-mono text-zinc-700">{label}</span>
              <span className="text-zinc-500">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
