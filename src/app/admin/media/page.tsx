"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminEmptyState,
  AdminListSkeleton,
} from "@/components/admin/AdminSkeleton";
import {
  MAX_IMAGE_BYTES,
  fileSizeError,
  formatBytes,
} from "@/lib/media-limits";

type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const load = useCallback(async (search?: string) => {
    const params = new URLSearchParams();
    const term = (search ?? q).trim();
    if (term) params.set("q", term);
    try {
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load media");
        setMedia([]);
        return;
      }
      setMedia(data.media ?? []);
    } catch {
      setError("Failed to load media");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setSaving(true);
    setError(null);
    const form = new FormData(formEl);
    const url = String(form.get("url") ?? "").trim();
    const originalName =
      String(form.get("originalName") ?? "").trim() ||
      url.split("/").pop() ||
      "asset";
    const filename = originalName.replace(/\s+/g, "-").toLowerCase();
    const mimeType = String(form.get("mimeType") ?? "image/jpeg").trim();
    const sizeBytes = Number(form.get("sizeBytes") ?? 1) || 1;

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          originalName,
          mimeType,
          sizeBytes,
          url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      formEl.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = (form.elements.namedItem("file") as HTMLInputElement | null)
      ?.files?.[0];
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    const sizeError = fileSizeError(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }
    setSaving(true);
    setError(null);
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function onRename(id: string) {
    const name = renameValue.trim();
    if (!name) return;
    setError(null);
    const res = await fetch("/api/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, originalName: name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Rename failed");
      return;
    }
    setRenamingId(null);
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this media item?")) return;
    setError(null);
    const res = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Media</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name…"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
        >
          Search
        </button>
      </div>

      <form
        onSubmit={onUpload}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <p className="w-full text-sm font-medium text-zinc-700">Upload file</p>
        <p className="w-full text-xs text-zinc-500">
          Images up to {formatBytes(MAX_IMAGE_BYTES)}. Larger files are rejected
          before upload so the page does not hang.
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">File (jpeg/png/webp/gif/mp4)</span>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
            required
            className="text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const sizeError = fileSizeError(file);
              setError(sizeError);
            }}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Uploading…" : "Upload"}
        </button>
      </form>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-2"
      >
        <p className="sm:col-span-2 text-sm font-medium text-zinc-700">
          Add by URL
        </p>
        <label className="sm:col-span-2 flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">URL</span>
          <input
            name="url"
            type="url"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Original name</span>
          <input
            name="originalName"
            placeholder="banner.jpg"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">MIME type</span>
          <input
            name="mimeType"
            defaultValue="image/jpeg"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Size (bytes)</span>
          <input
            name="sizeBytes"
            type="number"
            min={1}
            defaultValue={1}
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add media"}
          </button>
        </div>
      </form>

      {loading ? (
        <AdminListSkeleton />
      ) : media.length === 0 ? (
        <AdminEmptyState
          title="No media yet"
          description="Upload a file or add a URL to start your media library."
        />
      ) : (
      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {media.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              {renamingId === item.id ? (
                <div className="flex gap-2">
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="flex-1 rounded-md border border-zinc-300 px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => void onRename(item.id)}
                    className="text-zinc-900 underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingId(null)}
                    className="text-zinc-500 underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex min-w-0 items-center gap-3">
                  {item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded border border-zinc-200 object-cover bg-zinc-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-[10px] text-zinc-500">
                      file
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {item.originalName}
                    </p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-zinc-500 underline"
                    >
                      {item.url}
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-3">
              {renamingId !== item.id && (
                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(item.id);
                    setRenameValue(item.originalName);
                  }}
                  className="text-zinc-700 underline"
                >
                  Rename
                </button>
              )}
              <button
                type="button"
                onClick={() => void onDelete(item.id)}
                className="text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
