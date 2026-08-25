import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const resolution = await resolveTenantFromHost(host);

  if (resolution.kind !== "tenant") {
    return [
      {
        url: `${protocol}://${host}/`,
        lastModified: new Date(),
      },
      {
        url: `${protocol}://${host}/register`,
        lastModified: new Date(),
      },
    ];
  }

  const pages = await prisma.page.findMany({
    where: {
      tenantId: resolution.tenant.id,
      status: "PUBLISHED",
    },
    select: { path: true, updatedAt: true },
  });

  return pages.map((page) => ({
    url: `${protocol}://${host}${page.path === "/" ? "" : page.path}`,
    lastModified: page.updatedAt,
  }));
}
