"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Seo = {
  name?: string;
  seoTitle: string | null;
  seoDescription: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
};

const empty: Seo = {
  seoTitle: "",
  seoDescription: "",
  faviconUrl: "",
  ogImageUrl: "",
  canonicalUrl: "",
  robotsIndex: true,
};

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<Seo>(empty);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/website/seo");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load SEO");
      return;
    }
    const s = data.seo as Seo;
    setSeo({
      name: s.name ?? "",
      seoTitle: s.seoTitle ?? "",
      seoDescription: s.seoDescription ?? "",
      faviconUrl: s.faviconUrl ?? "",
      ogImageUrl: s.ogImageUrl ?? "",
      canonicalUrl: s.canonicalUrl ?? "",
      robotsIndex: s.robotsIndex ?? true,
    });
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/website/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle: seo.seoTitle || null,
          seoDescription: seo.seoDescription || null,
          faviconUrl: seo.faviconUrl || null,
          ogImageUrl: seo.ogImageUrl || null,
          canonicalUrl: seo.canonicalUrl || null,
          robotsIndex: seo.robotsIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage("SEO settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const titleLength = seo.seoTitle?.length ?? 0;
  const descriptionLength = seo.seoDescription?.length ?? 0;
  const score = useMemo(() => {
    let points = 0;
    if (titleLength >= 30 && titleLength <= 60) points += 25;
    else if (titleLength > 0) points += 12;
    if (descriptionLength >= 120 && descriptionLength <= 160) points += 25;
    else if (descriptionLength > 0) points += 12;
    if (seo.ogImageUrl) points += 20;
    if (seo.canonicalUrl) points += 15;
    if (seo.robotsIndex) points += 15;
    return points;
  }, [descriptionLength, seo.canonicalUrl, seo.ogImageUrl, seo.robotsIndex, titleLength]);

  const scoreColor =
    score >= 85 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Search visibility
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">SEO center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Help search engines understand your website and show it attractively in results.
            Strong SEO improves discoverability, but rankings are never guaranteed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm font-medium text-emerald-700">{message}</span>}
          {error && <span className="text-sm font-medium text-red-600">{error}</span>}
          <button
            type="submit"
            form="seo-form"
            disabled={saving}
            className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save SEO"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <form id="seo-form" onSubmit={onSave} className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-zinc-950">Search result listing</h2>
                <p className="mt-1 text-xs text-zinc-500">The title and description people see on Google.</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className={`h-2.5 w-2.5 rounded-full ${scoreColor}`} />
                <span className="text-sm font-bold text-zinc-800">{score}/100</span>
              </div>
            </div>

            <label className="block text-sm">
              <span className="flex items-center justify-between font-semibold text-zinc-800">
                SEO title
                <span className={titleLength > 60 ? "text-rose-600" : "text-zinc-400"}>
                  {titleLength}/60
                </span>
              </span>
              <input
                value={seo.seoTitle ?? ""}
                onChange={(e) => setSeo((s) => ({ ...s, seoTitle: e.target.value }))}
                maxLength={200}
                placeholder="Your Club Name — Esports, Teams & Events"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <span className="mt-1 block text-xs text-zinc-500">Aim for 30–60 characters. Put your main phrase near the beginning.</span>
            </label>

            <label className="mt-5 block text-sm">
              <span className="flex items-center justify-between font-semibold text-zinc-800">
                SEO description
                <span className={descriptionLength > 160 ? "text-rose-600" : "text-zinc-400"}>
                  {descriptionLength}/160
                </span>
              </span>
              <textarea
                value={seo.seoDescription ?? ""}
                onChange={(e) => setSeo((s) => ({ ...s, seoDescription: e.target.value }))}
                maxLength={500}
                rows={4}
                placeholder="Join our gaming community for tournaments, competitive teams, events, and weekly scrims."
                className="mt-2 w-full resize-y rounded-xl border border-zinc-200 px-3 py-3 text-sm leading-6 text-zinc-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <span className="mt-1 block text-xs text-zinc-500">Aim for 120–160 characters. Explain what makes your project useful.</span>
            </label>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-zinc-950">Social sharing & technical SEO</h2>
              <p className="mt-1 text-xs text-zinc-500">These settings improve previews and prevent duplicate URLs.</p>
            </div>
            <div className="space-y-5">
              {(
                [
                  ["ogImageUrl", "Social preview image URL", "Use a 1200×630 image with your logo and project name."],
                  ["faviconUrl", "Favicon URL", "A square PNG or ICO shown in browser tabs and bookmarks."],
                  ["canonicalUrl", "Canonical URL", "Your preferred public URL, including https://."],
                ] as const
              ).map(([key, label, hint]) => (
                <label key={key} className="block text-sm">
                  <span className="font-semibold text-zinc-800">{label}</span>
                  <input
                    type="url"
                    value={seo[key] ?? ""}
                    onChange={(e) => setSeo((s) => ({ ...s, [key]: e.target.value }))}
                    placeholder="https://example.com/..."
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-3 text-sm text-zinc-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                  <span className="mt-1 block text-xs text-zinc-500">{hint}</span>
                </label>
              ))}
            </div>
            <label className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
              <input
                type="checkbox"
                checked={seo.robotsIndex}
                onChange={(e) => setSeo((s) => ({ ...s, robotsIndex: e.target.checked }))}
                className="mt-0.5 size-4 rounded border-zinc-300 accent-emerald-600"
              />
              <span>
                <span className="block font-semibold text-emerald-950">Allow search engines to index</span>
                <span className="mt-1 block text-xs leading-5 text-emerald-800">
                  Keep enabled for a public website. Disable only for private, staging, or unfinished sites.
                </span>
              </span>
            </label>
          </section>
        </form>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="font-semibold text-zinc-950">Google preview</h2>
              <p className="mt-1 text-xs text-zinc-500">A preview of your organic search result.</p>
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="truncate text-xs text-zinc-500">example.com › home</p>
                <h3 className="mt-2 line-clamp-2 text-lg leading-6 text-blue-700">
                  {seo.seoTitle || seo.name || "Your website title"}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm leading-5 text-zinc-600">
                  {seo.seoDescription || "Add a clear description to explain your website to search visitors."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-950">SEO checklist</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                [titleLength >= 30 && titleLength <= 60, "Title is 30–60 characters"],
                [descriptionLength >= 120 && descriptionLength <= 160, "Description is 120–160 characters"],
                [Boolean(seo.ogImageUrl), "Social preview image is configured"],
                [Boolean(seo.canonicalUrl), "Canonical URL is configured"],
                [seo.robotsIndex, "Search indexing is enabled"],
              ].map(([complete, label]) => (
                <li key={String(label)} className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-400"}`}>
                    {complete ? "✓" : "–"}
                  </span>
                  <span className={complete ? "text-zinc-700" : "text-zinc-500"}>{label}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 to-violet-50 p-5">
            <h2 className="font-semibold text-sky-950">What helps you rank?</h2>
            <p className="mt-2 text-sm leading-6 text-sky-900/75">
              Publish useful pages, use phrases your audience searches for, keep content
              original, earn relevant links, and connect your domain to Google Search Console.
              This app automatically provides metadata, structured data, robots.txt, and a sitemap.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
