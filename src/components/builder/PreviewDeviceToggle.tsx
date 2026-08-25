"use client";

import { useMemo, useState } from "react";
import type { PageContent } from "@/lib/page-schema";
import {
  PageRenderer,
  type RenderDevice,
} from "@/components/renderer/PageRenderer";

type Props = {
  content: PageContent;
  title: string;
  initialDevice?: RenderDevice;
};

export function PreviewDeviceToggle({
  content,
  title,
  initialDevice = "desktop",
}: Props) {
  const [device, setDevice] = useState<RenderDevice>(initialDevice);

  const widthClass = useMemo(() => {
    if (device === "mobile") return "max-w-[390px]";
    if (device === "tablet") return "max-w-[768px]";
    return "max-w-5xl";
  }, [device]);

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500">Draft preview</p>
        <div className="ml-auto flex gap-1">
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
      </div>
      <div className="p-6">
        <div
          className={`mx-auto overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm ${widthClass}`}
        >
          <PageRenderer content={content} device={device} />
        </div>
      </div>
    </div>
  );
}
