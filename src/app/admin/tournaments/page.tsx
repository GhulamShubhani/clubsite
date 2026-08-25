"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminTournamentsPage() {
  return (
    <CrudPanel
      title="Tournaments"
      endpoint="/api/gaming/tournaments"
      itemsKey="tournaments"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "game", label: "Game" },
        { name: "prizePool", label: "Prize pool" },
        { name: "startsAt", label: "Starts at", type: "datetime-local" },
        { name: "endsAt", label: "Ends at", type: "datetime-local" },
        { name: "description", label: "Description" },
      ]}
      getLabel={(item) => String(item.name)}
      getMeta={(item) =>
        [item.game, item.prizePool].filter(Boolean).map(String).join(" · ") ||
        null
      }
    />
  );
}
