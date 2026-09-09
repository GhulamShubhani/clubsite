import { NextResponse } from "next/server";
import { MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { resolveTenantFromSlug } from "@/lib/tenant/resolve-by-slug";

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Public match + event list for the live club calendar.
 * Tenant comes from ?slug= or the request Host header — never a client tenant id.
 */
export async function GET(request: Request) {
  try {
    const rl = rateLimit(`public-matches:${clientKey(request)}`, {
      limit: 60,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug")?.trim().toLowerCase() ?? "";

    let tenantId: string | null = null;
    if (slug) {
      const tenant = await resolveTenantFromSlug(slug);
      tenantId = tenant.id;
    } else {
      const resolved = await resolveTenantFromHost(request.headers.get("host"));
      if (resolved.kind === "tenant") {
        tenantId = resolved.tenant.id;
      }
    }

    if (!tenantId) {
      throw new NotFoundError("Club website not found");
    }

    const [matches, events] = await Promise.all([
      prisma.match.findMany({
        where: {
          tenantId,
          startsAt: { not: null },
          status: { not: MatchStatus.CANCELED },
        },
        orderBy: { startsAt: "asc" },
        select: {
          title: true,
          game: true,
          startsAt: true,
          teamAName: true,
          teamBName: true,
          status: true,
        },
      }),
      prisma.clubEvent.findMany({
        where: { tenantId, startsAt: { not: null } },
        orderBy: { startsAt: "asc" },
        select: {
          title: true,
          location: true,
          startsAt: true,
        },
      }),
    ]);

    const items = [
      ...matches.map((match) => ({
        title:
          match.title ||
          [match.teamAName, match.teamBName].filter(Boolean).join(" vs ") ||
          "Match",
        game: match.game ?? "",
        startsAt: match.startsAt?.toISOString() ?? "",
      })),
      ...events.map((event) => ({
        title: event.title,
        game: event.location || "Event",
        startsAt: event.startsAt?.toISOString() ?? "",
      })),
    ].filter((item) => item.startsAt);

    return jsonOk({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
