"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type TemplatePage = { title: string; path: string };

type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  previewUrl: string | null;
  pageCount?: number;
  pages?: TemplatePage[];
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/templates");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load templates");
      return;
    }
    setTemplates(data.templates ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onApply(templateKey: string, pageCount: number) {
    if (
      !confirm(
        `Apply “${templateKey}”? This replaces your current pages with a full ${pageCount}-page website (published live immediately).`,
      )
    ) {
      return;
    }
    setBusy(templateKey);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Apply failed");
      setMessage(
        `Applied “${templateKey}” — ${data.pages?.length ?? pageCount} pages are now live.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Templates</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Preview any template before applying. Each one is a complete multi-page website with
          navigation, theme, images, and gaming sections.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {templates.map((t) => {
          const pageCount = t.pageCount ?? t.pages?.length ?? 0;
          const isExpanded = expanded === t.key;
          return (
            <article
              key={t.id}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-zinc-900">{t.name}</h2>
                    <p className="mt-0.5 text-xs font-medium text-sky-700">
                      {pageCount} pages · full website
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                    {t.key}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm text-zinc-600">{t.description ?? "No description"}</p>

                {t.pages && t.pages.length > 0 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : t.key)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                    >
                      {isExpanded ? "Hide pages" : `Show all ${pageCount} pages`}
                    </button>
                    {isExpanded && (
                      <ul className="mt-2 space-y-1 rounded-md border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-700">
                        {t.pages.map((p) => (
                          <li key={p.path} className="flex justify-between gap-2">
                            <span>{p.title}</span>
                            <span className="font-mono text-zinc-400">{p.path}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isExpanded && (
                      <p className="mt-2 text-xs text-zinc-500">
                        Includes:{" "}
                        {t.pages
                          .slice(0, 4)
                          .map((p) => p.title)
                          .join(", ")}
                        {t.pages.length > 4 ? ` +${t.pages.length - 4} more` : ""}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/templates/preview/${t.key}`}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    Preview website
                  </Link>
                  <button
                    type="button"
                    disabled={busy === t.key}
                    onClick={() => void onApply(t.key, pageCount)}
                    className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {busy === t.key ? "Building…" : "Apply"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {templates.length === 0 && (
        <p className="text-sm text-zinc-500">No templates available.</p>
      )}
    </div>
  );
}
