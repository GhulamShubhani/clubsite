"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminStreamsPage() {
  return (
    <CrudPanel
      title="Streams"
      endpoint="/api/gaming/streams"
      itemsKey="streams"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "platform", label: "Platform", required: true, placeholder: "Twitch" },
        { name: "url", label: "URL", type: "url", required: true },
        { name: "embedUrl", label: "Embed URL", type: "url" },
        { name: "isLive", label: "Live now", type: "checkbox" },
      ]}
      getLabel={(item) => String(item.title)}
      getMeta={(item) =>
        [item.platform, item.isLive ? "LIVE" : null]
          .filter(Boolean)
          .map(String)
          .join(" · ") || null
      }
    />
  );
}
