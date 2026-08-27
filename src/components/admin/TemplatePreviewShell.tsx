"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { PageContent } from "@/lib/page-schema";
import {
  PageRenderer,
  type RenderDevice,
} from "@/components/renderer/PageRenderer";
import { previewPathFor, isInternalSitePath } from "@/templates/preview/links";
import { themeTokensToCssVars } from "@/templates/tokens/css-vars";

type PageLink = { title: string; path: string };

type Props = {
  templateKey: string;
  templateName: string;
  pages: PageLink[];
  currentPath: string;
  content: PageContent;
  themeTokens: Record<string, unknown>;
  initialDevice?: RenderDevice;
};

export function TemplatePreviewShell({
  templateKey,
  templateName,
  pages,
  currentPath,
  content,
  themeTokens,
  initialDevice = "desktop",
}: Props) {
  const router = useRouter();
  const [device, setDevice] = useState<RenderDevice>(initialDevice);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widthClass = useMemo(() => {
    if (device === "mobile") return "max-w-[390px]";
    if (device === "tablet") return "max-w-[768px]";
    return "max-w-6xl";
  }, [device]);

  const themeStyle = useMemo(
    () => themeTokensToCssVars(themeTokens),
    [themeTokens],
  );

  const handlePreviewClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !isInternalSitePath(href)) return;
      event.preventDefault();
      const next = previewPathFor(templateKey, href);
      if (next) router.push(next);
    },
    [router, templateKey],
  );

  async function onApply() {
    if (
      !confirm(
        `Apply “${templateName}”? This replaces your current pages with this full website.`,
      )
    ) {
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Apply failed");
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-100">
      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Link
            href="/admin/templates"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← Templates
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {templateName}
            </p>
            <p className="text-xs text-amber-700">Preview — not applied yet</p>
          </div>

          <label className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
            Page
            <select
              value={currentPath}
              onChange={(e) => {
                const path = e.target.value;
                const qs = path === "/" ? "" : `?path=${encodeURIComponent(path)}`;
                router.push(`/admin/templates/preview/${templateKey}${qs}`);
              }}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900"
            >
              {pages.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.title} ({p.path})
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-1">
            {(
              [
                ["desktop", "Desktop"],
                ["tablet", "Tablet"],
                ["mobile", "Mobile"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDevice(value)}
                className={
                  device === value
                    ? "rounded-md bg-zinc-900 px-3 py-1 text-xs font-medium text-white"
                    : "rounded-md px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={applying}
            onClick={() => void onApply()}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {applying ? "Applying…" : "Apply this template"}
          </button>
        </div>
        {error && (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div
          role="presentation"
          onClick={handlePreviewClick}
          className={`site-theme mx-auto min-h-[80vh] overflow-hidden rounded-xl border border-zinc-700/30 shadow-2xl ${widthClass}`}
          style={themeStyle}
        >
          <PageRenderer content={content} device={device} themeTokens={themeTokens} />
        </div>
      </div>
    </div>
  );
}
