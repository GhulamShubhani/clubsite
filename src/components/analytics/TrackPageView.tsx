"use client";

import { useEffect } from "react";

type Props = {
  path: string;
};

export function TrackPageView({ path }: Props) {
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: typeof document !== "undefined" ? document.referrer : null,
        deviceType:
          typeof window !== "undefined" && window.innerWidth < 768
            ? "mobile"
            : typeof window !== "undefined" && window.innerWidth < 1024
              ? "tablet"
              : "desktop",
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      /* ignore analytics failures */
    });
    return () => controller.abort();
  }, [path]);

  return null;
}
