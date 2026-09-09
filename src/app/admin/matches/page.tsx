"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminMatchesPage() {
  return (
    <CrudPanel
      title="Matches"
      description="Add the matches visitors should see on the website calendar. Set the date and time, then they appear on the live site automatically — no need to republish the page."
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
        [
          item.status,
          item.teamAName,
          item.teamBName,
          item.startsAt
            ? new Date(String(item.startsAt)).toLocaleString(undefined, {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
        ]
          .filter(Boolean)
          .map(String)
          .join(" · ") || null
      }
    />
  );
}
