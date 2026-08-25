"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminLeaderboardsPage() {
  return (
    <CrudPanel
      title="Leaderboards"
      endpoint="/api/gaming/leaderboards"
      itemsKey="leaderboards"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "game", label: "Game" },
      ]}
      getLabel={(item) => String(item.name)}
      getMeta={(item) => (item.game ? String(item.game) : null)}
    />
  );
}
