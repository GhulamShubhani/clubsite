"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminMatchesPage() {
  return (
    <CrudPanel
      title="Matches"
      endpoint="/api/gaming/matches"
      itemsKey="matches"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "game", label: "Game" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "UPCOMING", label: "Upcoming" },
            { value: "LIVE", label: "Live" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELED", label: "Canceled" },
          ],
        },
        { name: "teamAName", label: "Team A" },
        { name: "teamBName", label: "Team B" },
        { name: "startsAt", label: "Starts at", type: "datetime-local" },
      ]}
      getLabel={(item) => String(item.title)}
      getMeta={(item) =>
        [item.status, item.teamAName, item.teamBName]
          .filter(Boolean)
          .map(String)
          .join(" · ") || null
      }
    />
  );
}
