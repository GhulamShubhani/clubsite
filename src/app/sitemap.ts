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

  const website = await prisma.website.findUnique({
    where: { tenantId: resolution.tenant.id },
    select: { robotsIndex: true },
  });
  if (website && !website.robotsIndex) {
    return [];
  }

  const pages = await prisma.page.findMany({
    where: {
      tenantId: resolution.tenant.id,
      status: "PUBLISHED",
    },
    select: { path: true, updatedAt: true },
  });

  return pages.map((page) => {
    const isHome = page.path === "/";
    return {
      url: `${protocol}://${host}${isHome ? "" : page.path}`,
      lastModified: page.updatedAt,
      changeFrequency: isHome ? "daily" : "weekly",
      priority: isHome ? 1 : 0.7,
    };
  });
}
