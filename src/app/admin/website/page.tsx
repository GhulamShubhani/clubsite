"use client";

import { useCallback, useEffect, useState } from "react";

export default function AdminWebsitePage() {
  const [name, setName] = useState("");
  const [templateKey, setTemplateKey] = useState<string>("");
  const [templates, setTemplates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/website");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load website");
      return;
    }
    setName(data.website?.name ?? "");
    setTemplateKey(data.website?.templateKey ?? "");
    setTemplates(data.templates ?? []);
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
      const res = await fetch("/api/website", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateKey: templateKey || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setName(data.website.name);
      setTemplateKey(data.website.templateKey ?? "");
      setMessage("Website settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Website</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Site name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Template</span>
          <select
            value={templateKey}
            onChange={(e) => setTemplateKey(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2"
          >
            <option value="">None</option>
            {templates.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
