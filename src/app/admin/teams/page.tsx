"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminTeamsPage() {
  return (
    <CrudPanel
      title="Teams"
      endpoint="/api/gaming/teams"
      itemsKey="teams"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "tag", label: "Tag", placeholder: "ABC" },
        { name: "game", label: "Game" },
        { name: "logoUrl", label: "Logo URL", type: "url" },
        { name: "description", label: "Description" },
      ]}
      getLabel={(item) => String(item.name)}
      getMeta={(item) =>
        [item.tag, item.game].filter(Boolean).map(String).join(" · ") || null
      }
    />
  );
}
