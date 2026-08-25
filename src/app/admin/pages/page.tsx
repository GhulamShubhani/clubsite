"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PageRow = {
  id: string;
  title: string;
  path: string;
  status: string;
  sortOrder: number;
};

function statusBadge(status: string) {
  const base =
    "inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide";
  if (status === "PUBLISHED") {
    return `${base} bg-emerald-100 text-emerald-800`;
  }
  if (status === "HIDDEN") {
    return `${base} bg-zinc-200 text-zinc-600`;
  }
  return `${base} bg-amber-100 text-amber-800`;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [edits, setEdits] = useState<
    Record<string, { title: string; path: string }>
  >({});

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/pages");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load pages");
      return;
    }
    const list = (data.pages ?? []) as PageRow[];
    setPages(list);
    setEdits(
      Object.fromEntries(
        list.map((p) => [p.id, { title: p.title, path: p.path }]),
      ),
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchPage(
    id: string,
    body: Record<string, unknown>,
    busyKey = id,
  ) {
    setBusy(busyKey);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy("create");
    setError(null);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const path = String(form.get("path") ?? "").trim();
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveInline(page: PageRow) {
    const edit = edits[page.id];
    if (!edit) return;
    if (edit.title === page.title && edit.path === page.path) return;
    await patchPage(page.id, { title: edit.title, path: edit.path });
  }

  async function onPublish(id: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Publish failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this page?")) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  async function onDuplicate(page: PageRow) {
    setBusy(page.id);
    setError(null);
    const slug = page.path.replace(/\/$/, "") || "/page";
    const path = `${slug}-copy-${Date.now().toString(36)}`;
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${page.title} (copy)`,
          path,
          duplicateFromPageId: page.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Duplicate failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setBusy(null);
    }
  }

  async function move(page: PageRow, direction: -1 | 1) {
    const sorted = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((p) => p.id === page.id);
    const swapWith = sorted[idx + direction];
    if (!swapWith) return;
    setBusy(page.id);
    setError(null);
    try {
      const resA = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: swapWith.sortOrder }),
      });
      if (!resA.ok) {
        const data = await resA.json();
        throw new Error(data.error ?? "Reorder failed");
      }
      const resB = await fetch(`/api/pages/${swapWith.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: page.sortOrder }),
      });
      if (!resB.ok) {
        const data = await resB.json();
        throw new Error(data.error ?? "Reorder failed");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reorder failed");
    } finally {
      setBusy(null);
    }
  }

  const sorted = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Pages</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form
        onSubmit={onCreate}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Title</span>
          <input
            name="title"
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Path</span>
          <input
            name="path"
            required
            placeholder="/about"
            className="rounded-md border border-zinc-300 px-3 py-2 font-mono"
          />
        </label>
        <button
          type="submit"
          disabled={busy === "create"}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Create page
        </button>
      </form>

      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
        {sorted.map((page, index) => {
          const edit = edits[page.id] ?? {
            title: page.title,
            path: page.path,
          };
          return (
            <li key={page.id} className="space-y-3 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-48 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 font-medium text-zinc-900"
                      value={edit.title}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [page.id]: { ...edit, title: e.target.value },
                        }))
                      }
                      onBlur={() => void saveInline(page)}
                    />
                    <span className={statusBadge(page.status)}>
                      {page.status}
                    </span>
                  </div>
                  <input
                    className="w-full max-w-md rounded-md border border-zinc-300 px-2 py-1.5 font-mono text-zinc-600"
                    value={edit.path}
                    onChange={(e) =>
                      setEdits((prev) => ({
                        ...prev,
                        [page.id]: { ...edit, path: e.target.value },
                      }))
                    }
                    onBlur={() => void saveInline(page)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={busy === page.id || index === 0}
                    onClick={() => void move(page, -1)}
                    className="text-xs text-zinc-600 underline disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={busy === page.id || index === sorted.length - 1}
                    onClick={() => void move(page, 1)}
                    className="text-xs text-zinc-600 underline disabled:opacity-40"
                  >
                    Move down
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Link
                  href={`/admin/builder/${page.id}`}
                  className="text-zinc-700 underline"
                >
                  Builder
                </Link>
                <Link
                  href={`/admin/preview/${page.id}`}
                  className="text-zinc-700 underline"
                >
                  Preview
                </Link>
                <button
                  type="button"
                  disabled={busy === page.id}
                  onClick={() => void onPublish(page.id)}
                  className="text-zinc-700 underline disabled:opacity-50"
                >
                  Publish
                </button>
                {page.status === "PUBLISHED" || page.status === "HIDDEN" ? (
                  <button
                    type="button"
                    disabled={busy === page.id}
                    onClick={() =>
                      void patchPage(page.id, { status: "DRAFT" })
                    }
                    className="text-zinc-700 underline disabled:opacity-50"
                  >
                    {page.status === "HIDDEN" ? "Show" : "Unpublish"}
                  </button>
                ) : null}
                {page.status !== "HIDDEN" ? (
                  <button
                    type="button"
                    disabled={busy === page.id}
                    onClick={() =>
                      void patchPage(page.id, { status: "HIDDEN" })
                    }
                    className="text-zinc-700 underline disabled:opacity-50"
                  >
                    Hide
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy === page.id}
                  onClick={() => void onDuplicate(page)}
                  className="text-zinc-700 underline disabled:opacity-50"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  disabled={busy === page.id}
                  onClick={() => void onDelete(page.id)}
                  className="text-red-600 underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
        {pages.length === 0 && (
          <li className="px-4 py-6 text-sm text-zinc-500">No pages yet.</li>
        )}
      </ul>
    </div>
  );
}
