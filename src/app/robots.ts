import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { prisma } from "@/lib/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const resolution = await resolveTenantFromHost(host);

  if (resolution.kind === "tenant") {
    const website = await prisma.website.findUnique({
      where: { tenantId: resolution.tenant.id },
      select: { robotsIndex: true },
    });

    if (website && !website.robotsIndex) {
      return {
        rules: { userAgent: "*", disallow: "/" },
      };
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/register"],
    },
    sitemap: `${protocol}://${host}/sitemap.xml`,
  };
}
