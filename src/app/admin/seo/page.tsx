"use client";

import { useCallback, useEffect, useState } from "react";

type Seo = {
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
      seoTitle: s.seoTitle ?? "",
      seoDescription: s.seoDescription ?? "",
      faviconUrl: s.faviconUrl ?? "",
      ogImageUrl: s.ogImageUrl ?? "",
      canonicalUrl: s.canonicalUrl ?? "",
      robotsIndex: s.robotsIndex ?? true,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent) {
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

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">SEO</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <form
        onSubmit={onSave}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        {(
          [
            ["seoTitle", "SEO title"],
            ["seoDescription", "SEO description"],
            ["faviconUrl", "Favicon URL"],
            ["ogImageUrl", "OG image URL"],
            ["canonicalUrl", "Canonical URL"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">{label}</span>
            {key === "seoDescription" ? (
              <textarea
                value={seo[key] ?? ""}
                onChange={(e) =>
                  setSeo((s) => ({ ...s, [key]: e.target.value }))
                }
                rows={3}
                className="rounded-md border border-zinc-300 px-3 py-2"
              />
            ) : (
              <input
                value={seo[key] ?? ""}
                onChange={(e) =>
                  setSeo((s) => ({ ...s, [key]: e.target.value }))
                }
                className="rounded-md border border-zinc-300 px-3 py-2"
              />
            )}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={seo.robotsIndex}
            onChange={(e) =>
              setSeo((s) => ({ ...s, robotsIndex: e.target.checked }))
            }
            className="size-4 rounded border-zinc-300"
          />
          Allow search engines to index
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save SEO"}
        </button>
      </form>
    </div>
  );
}
