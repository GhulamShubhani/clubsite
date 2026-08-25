"use client";

import { useCallback, useEffect, useState } from "react";

type Tokens = {
  primary: string;
  background: string;
  text: string;
  fontFamily: string;
};

const defaults: Tokens = {
  primary: "#18181b",
  background: "#ffffff",
  text: "#18181b",
  fontFamily: "system-ui, sans-serif",
};

export default function AdminThemePage() {
  const [tokens, setTokens] = useState<Tokens>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/theme");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load theme");
      return;
    }
    setTokens({ ...defaults, ...(data.tokens as Tokens) });
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
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setTokens({ ...defaults, ...(data.tokens as Tokens) });
      setMessage("Theme saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Theme</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <form
        onSubmit={onSave}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4"
      >
        {(
          [
            ["primary", "Primary"],
            ["background", "Background"],
            ["text", "Text"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-zinc-700">{label}</span>
            <input
              type="color"
              value={tokens[key].startsWith("#") ? tokens[key] : "#18181b"}
              onChange={(e) =>
                setTokens((t) => ({ ...t, [key]: e.target.value }))
              }
              className="h-9 w-16 cursor-pointer rounded border border-zinc-300"
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-700">Font family</span>
          <input
            value={tokens.fontFamily}
            onChange={(e) =>
              setTokens((t) => ({ ...t, fontFamily: e.target.value }))
            }
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save theme"}
        </button>
      </form>
    </div>
  );
}
