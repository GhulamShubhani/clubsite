"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminEventsPage() {
  return (
    <CrudPanel
      title="Events"
      endpoint="/api/gaming/events"
      itemsKey="events"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "location", label: "Location" },
        { name: "startsAt", label: "Starts at", type: "datetime-local" },
        { name: "endsAt", label: "Ends at", type: "datetime-local" },
        { name: "description", label: "Description" },
      ]}
      getLabel={(item) => String(item.title)}
      getMeta={(item) => (item.location ? String(item.location) : null)}
    />
  );
}
