"use client";

import { useCallback, useEffect, useState } from "react";

type NavItem = { label: string; href: string };

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [jsonText, setJsonText] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/navigation");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load navigation");
      return;
    }
    const next = (data.items as NavItem[]) ?? [];
    setItems(next);
    setJsonText(JSON.stringify(next, null, 2));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateItem(index: number, patch: Partial<NavItem>) {
    setItems((prev) => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      );
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function addItem() {
    setItems((prev) => {
      const next = [...prev, { label: "Link", href: "/" }];
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function removeItem(index: number) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonText) as NavItem[];
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      setItems(
        parsed.map((item) => ({
          label: String(item.label ?? ""),
          href: String(item.href ?? ""),
        })),
      );
      setError(null);
    } catch {
      setError("Invalid JSON");
    }
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage("Navigation saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Navigation</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <input
              value={item.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
              placeholder="Label"
              className="min-w-32 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              value={item.href}
              onChange={(e) => updateItem(index, { href: e.target.value })}
              placeholder="/path"
              className="min-w-32 flex-1 rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-zinc-700 underline"
        >
          Add item
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700">
          JSON editor
        </label>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={8}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={applyJson}
          className="text-sm text-zinc-700 underline"
        >
          Apply JSON to list
        </button>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave()}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save navigation"}
      </button>
    </div>
  );
}
