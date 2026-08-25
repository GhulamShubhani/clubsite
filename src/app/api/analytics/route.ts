import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { requireTenantAccess } from "@/lib/tenant/access";

function topCounts(
  rows: { key: string | null; count: number }[],
  limit = 10,
) {
  return rows
    .filter((r) => r.key)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((r) => ({ value: r.key as string, count: r.count }));
}

export async function GET() {
  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    const tenantId = ctx.tenant.id;
    const now = new Date();
    const days7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalViews,
      viewsLast7Days,
      viewsLast30Days,
      topPathsRaw,
      referrersRaw,
      devicesRaw,
      countriesRaw,
      recent,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: { tenantId } }),
      prisma.analyticsEvent.count({
        where: { tenantId, createdAt: { gte: days7 } },
      }),
      prisma.analyticsEvent.count({
        where: { tenantId, createdAt: { gte: days30 } },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["path"],
        where: { tenantId, createdAt: { gte: days30 } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ["referrer"],
        where: {
          tenantId,
          createdAt: { gte: days30 },
          referrer: { not: null },
        },
        _count: { referrer: true },
        orderBy: { _count: { referrer: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ["deviceType"],
        where: { tenantId, createdAt: { gte: days30 } },
        _count: { deviceType: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["country"],
        where: {
          tenantId,
          createdAt: { gte: days30 },
          country: { not: null },
        },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
      prisma.analyticsEvent.findMany({
        where: { tenantId, createdAt: { gte: days30 } },
        select: { userAgent: true, path: true, createdAt: true },
        take: 5000,
      }),
    ]);

    // Approx unique visitors: distinct userAgent (fallback) + day+path+ua buckets
    const uaSet = new Set<string>();
    const dayBucket = new Set<string>();
    for (const row of recent) {
      const ua = row.userAgent || "unknown";
      uaSet.add(ua);
      const day = row.createdAt.toISOString().slice(0, 10);
      dayBucket.add(`${day}|${ua}|${row.path}`);
    }

    return jsonOk({
      summary: {
        totalViews,
        viewsLast7Days,
        viewsLast30Days,
        uniqueVisitorsApprox: uaSet.size,
        uniqueDayPathVisitorsApprox: dayBucket.size,
        topPaths: topPathsRaw.map((row) => ({
          path: row.path,
          count: row._count.path,
        })),
        topReferrers: topCounts(
          referrersRaw.map((r) => ({
            key: r.referrer,
            count: r._count.referrer,
          })),
        ),
        devices: devicesRaw.map((r) => ({
          deviceType: r.deviceType ?? "unknown",
          count: r._count.deviceType,
        })),
        countries: topCounts(
          countriesRaw.map((r) => ({
            key: r.country,
            count: r._count.country,
          })),
        ),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
