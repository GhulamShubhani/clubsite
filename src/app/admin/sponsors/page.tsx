"use client";

import { CrudPanel } from "@/components/admin/CrudPanel";

export default function AdminSponsorsPage() {
  return (
    <CrudPanel
      title="Sponsors"
      description="Add a sponsor here. It is saved and listed below straight away."
      endpoint="/api/gaming/sponsors"
      itemsKey="sponsors"
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "tier", label: "Tier" },
        { name: "logoUrl", label: "Logo URL", type: "url" },
        { name: "websiteUrl", label: "Website URL", type: "url" },
      ]}
      getLabel={(item) => String(item.name)}
      getMeta={(item) => (item.tier ? String(item.tier) : null)}
    />
  );
}
