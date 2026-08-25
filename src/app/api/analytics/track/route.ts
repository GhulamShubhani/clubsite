import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";

const trackSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).optional().nullable(),
  deviceType: z.string().max(40).optional().nullable(),
  country: z.string().max(8).optional().nullable(),
});

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function parseDeviceType(ua: string | null): string {
  if (!ua) return "desktop";
  const lower = ua.toLowerCase();
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(lower)) {
    return "mobile";
  }
  return "desktop";
}

/** Public page-view track resolved solely from the Host header. */
export async function POST(request: Request) {
  try {
    const rl = rateLimit(`analytics-track:${clientKey(request)}`, {
      limit: 120,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        },
      );
    }

    const body = trackSchema.parse(await request.json());
    const resolved = await resolveTenantFromHost(request.headers.get("host"));
    if (resolved.kind !== "tenant") {
      throw new NotFoundError("Club website not found");
    }

    const ua = request.headers.get("user-agent");
    const deviceType = body.deviceType || parseDeviceType(ua);
    // Prefer edge/CDN geo headers when present (Vercel/CF/etc.)
    const country =
      body.country ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    const event = await prisma.analyticsEvent.create({
      data: {
        tenantId: resolved.tenant.id,
        path: body.path,
        referrer: body.referrer ?? null,
        deviceType,
        country,
        userAgent: ua,
      },
    });

    return jsonOk({ ok: true, id: event.id }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
