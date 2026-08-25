"use client";

import { useCallback, useEffect, useState } from "react";

type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
};

type MediaPickerProps = {
  label?: string;
  value?: string;
  onSelect: (url: string) => void;
};

export function MediaPicker({
  label = "Media",
  value,
  onSelect,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      const res = await fetch(`/api/media${params}`);
      const data = (await res.json()) as {
        media?: MediaItem[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load media");
      setItems(data.media ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load(q);
  }, [open, q, load]);

  return (
    <div>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Choose…
        </button>
        {value ? (
          <span className="truncate font-mono text-[11px] text-zinc-500" title={value}>
            {value}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-400">None</span>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-900">Select media</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Close
              </button>
            </div>
            <div className="border-b border-zinc-200 px-4 py-2">
              <input
                className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <p className="p-3 text-sm text-zinc-500">Loading…</p>
              ) : error ? (
                <p className="p-3 text-sm text-red-600">{error}</p>
              ) : items.length === 0 ? (
                <p className="p-3 text-sm text-zinc-500">No media found.</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(item.url);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-zinc-100"
                      >
                        {item.mimeType.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded object-cover bg-zinc-100"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-zinc-100 text-[10px] text-zinc-500">
                            file
                          </div>
                        )}
                        <span className="truncate text-sm text-zinc-800">
                          {item.originalName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
