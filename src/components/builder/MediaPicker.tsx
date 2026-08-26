"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  accept?: string;
};

export function MediaPicker({
  label = "Media",
  value,
  onSelect,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.png,.jpg,.jpeg,.webp,.gif,.svg",
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    setUrlInput(value?.startsWith("http") || value?.startsWith("/") ? value : "");
    void load(q);
  }, [open, q, load, value]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        media?: MediaItem;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (!data.media?.url) throw new Error("Upload failed");
      onSelect(data.media.url);
      setOpen(false);
      await load(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function applyUrl() {
    const next = urlInput.trim();
    if (!next) {
      setError("Enter an image URL or path");
      return;
    }
    onSelect(next);
    setOpen(false);
  }

  function clearValue() {
    onSelect("");
    setOpen(false);
  }

  return (
    <div>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Choose…
        </button>
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-8 w-8 rounded border border-zinc-200 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              className="max-w-[9rem] truncate font-mono text-[11px] text-zinc-500"
              title={value}
            >
              {value}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-zinc-400">None</span>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-900">
                Select {label.toLowerCase()}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 border-b border-zinc-200 px-4 py-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-600">
                  Upload from device
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Choose file (PNG, JPG, WebP…)"}
                </button>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-600">
                  Or paste image URL
                </p>
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                    placeholder="https://… or /uploads/…"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={applyUrl}
                    className="cursor-pointer shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    Use URL
                  </button>
                </div>
              </div>

              {value ? (
                <button
                  type="button"
                  onClick={clearValue}
                  className="cursor-pointer text-xs text-red-600 underline"
                >
                  Remove current image
                </button>
              ) : null}
            </div>

            <div className="border-b border-zinc-200 px-4 py-2">
              <input
                className="w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                placeholder="Search library…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {error ? (
                <p className="p-3 text-sm text-red-600">{error}</p>
              ) : null}
              {loading ? (
                <p className="p-3 text-sm text-zinc-500">Loading…</p>
              ) : items.length === 0 ? (
                <p className="p-3 text-sm text-zinc-500">
                  No files in library yet. Upload from your device or paste a URL
                  above.
                </p>
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
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-zinc-100"
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
