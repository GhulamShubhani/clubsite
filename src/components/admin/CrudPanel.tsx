"use client";

import { useCallback, useEffect, useState } from "react";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "url" | "datetime-local" | "number" | "checkbox" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

type CrudPanelProps = {
  title: string;
  endpoint: string;
  itemsKey: string;
  fields: CrudField[];
  getLabel: (item: Record<string, unknown>) => string;
  getMeta?: (item: Record<string, unknown>) => string | null;
};

export function CrudPanel({
  title,
  endpoint,
  itemsKey,
  fields,
  getLabel,
  getMeta,
}: CrudPanelProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setItems((data[itemsKey] as Record<string, unknown>[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [endpoint, itemsKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "checkbox") {
        body[field.name] = form.get(field.name) === "on";
        continue;
      }
      const raw = String(form.get(field.name) ?? "").trim();
      if (!raw) {
        if (field.required) {
          setError(`${field.label} is required`);
          setSaving(false);
          return;
        }
        continue;
      }
      if (field.type === "number") {
        body[field.name] = Number(raw);
      } else if (field.type === "datetime-local") {
        body[field.name] = new Date(raw).toISOString();
      } else {
        body[field.name] = raw;
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 text-sm font-medium text-zinc-700">
          Add new
        </p>
        {fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600">{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.name}
                required={field.required}
                className="rounded-md border border-zinc-300 px-3 py-2"
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                name={field.name}
                type="checkbox"
                className="size-4 rounded border-zinc-300"
              />
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                placeholder={field.placeholder}
                className="rounded-md border border-zinc-300 px-3 py-2"
              />
            )}
          </label>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">No items yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
          {items.map((item) => {
            const id = String(item.id);
            const meta = getMeta?.(item);
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-900">{getLabel(item)}</p>
                  {meta && <p className="text-zinc-500">{meta}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
