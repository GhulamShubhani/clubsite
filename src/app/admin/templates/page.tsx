"use client";

import { useCallback, useEffect, useState } from "react";

type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  previewUrl: string | null;
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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

  async function onApply(templateKey: string) {
    if (!confirm("Apply this template? It may replace existing pages.")) return;
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
      setMessage(`Applied “${templateKey}” successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Templates</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((t) => (
          <article
            key={t.id}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white p-4"
          >
            <h2 className="font-medium text-zinc-900">{t.name}</h2>
            <p className="mt-1 flex-1 text-sm text-zinc-600">
              {t.description ?? "No description"}
            </p>
            <p className="mt-2 font-mono text-xs text-zinc-400">{t.key}</p>
            <button
              type="button"
              disabled={busy === t.key}
              onClick={() => void onApply(t.key)}
              className="mt-4 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy === t.key ? "Applying…" : "Apply"}
            </button>
          </article>
        ))}
      </div>
      {templates.length === 0 && (
        <p className="text-sm text-zinc-500">No templates available.</p>
      )}
    </div>
  );
}
