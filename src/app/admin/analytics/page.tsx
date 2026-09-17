"use client";

import { useEffect, useState } from "react";
import {
  AdminEmptyState,
  AdminListSkeleton,
  AdminStatsSkeleton,
} from "@/components/admin/AdminSkeleton";
import { analyticsIdError } from "@/lib/analytics-id";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gaId, setGaId] = useState("");
  const [gaSaving, setGaSaving] = useState(false);
  const [gaMessage, setGaMessage] = useState<string | null>(null);
  const gaWarning = analyticsIdError(gaId);

  useEffect(() => {
    void (async () => {
      try {
        const [analyticsRes, websiteRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/website"),
        ]);
        const analyticsData = await analyticsRes.json();
        const websiteData = await websiteRes.json();
        if (!analyticsRes.ok) {
          setError(analyticsData.error ?? "Failed to load analytics");
        } else {
          setSummary(analyticsData.summary);
        }
        if (websiteRes.ok) {
          setGaId(websiteData.website?.googleAnalyticsId ?? "");
        }
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveAnalyticsId(e: React.FormEvent) {
    e.preventDefault();
    if (gaWarning) {
      setGaMessage(null);
      return;
    }
    setGaSaving(true);
    setGaMessage(null);
    try {
      const res = await fetch("/api/website", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAnalyticsId: gaId.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setGaId(data.website?.googleAnalyticsId ?? "");
      setGaMessage(
        data.website?.googleAnalyticsId
          ? "Google Analytics ID saved. The tracking script will load on the public site."
          : "Google Analytics ID cleared.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setGaSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Analytics</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        onSubmit={(e) => void saveAnalyticsId(e)}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <h2 className="font-medium text-zinc-900">Google Analytics</h2>
        <p className="text-sm text-zinc-600">
          Paste a Measurement ID to load the official analytics script on your
          public website. Invalid IDs are rejected so the script cannot fail
          silently.
        </p>
        <label className="block text-sm">
          <span className="text-zinc-600">Google Analytics ID</span>
          <input
            value={gaId}
            onChange={(e) => {
              setGaId(e.target.value);
              setGaMessage(null);
            }}
            placeholder="G-XXXXXXXXXX"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm"
            aria-invalid={Boolean(gaWarning)}
          />
        </label>
        {gaWarning ? (
          <p className="text-sm text-red-600">{gaWarning}</p>
        ) : (
          <p className="text-xs text-zinc-500">
            Accepted formats: G-XXXXXXXXXX, UA-XXXXXXX-X, GT-XXXXXXX, or GTM-XXXXXXX.
          </p>
        )}
        {gaMessage ? (
          <p className="text-sm text-emerald-700">{gaMessage}</p>
        ) : null}
        <button
          type="submit"
          disabled={gaSaving || Boolean(gaWarning)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {gaSaving ? "Saving…" : "Save Analytics ID"}
        </button>
      </form>

      {loading && (
        <>
          <AdminStatsSkeleton />
          <AdminListSkeleton rows={4} />
        </>
      )}
      {!loading && !summary && !error && (
        <AdminEmptyState title="No data yet" description="Analytics will appear after visitors view your site." />
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
