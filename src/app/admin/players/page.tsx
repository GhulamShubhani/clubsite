"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminPlayersPage() {
  return (
    <CrudPanel
      title="Players"
      endpoint="/api/gaming/players"
      itemsKey="players"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "gamertag", label: "Gamertag" },
        { name: "role", label: "Role" },
        { name: "teamId", label: "Team ID", placeholder: "cuid (optional)" },
        { name: "avatarUrl", label: "Avatar URL", type: "url" },
      ]}
      getLabel={(item) => String(item.name)}
      getMeta={(item) =>
        [item.gamertag, item.role].filter(Boolean).map(String).join(" · ") ||
        null
      }
    />
  );
}
