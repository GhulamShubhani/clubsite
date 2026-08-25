import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { rateLimit } from "@/lib/security/rate-limit";

const querySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

function suggestAlternatives(slug: string): string[] {
  return [`${slug}-club`, `${slug}-esports`, `${slug}-gg`, `${slug}-hq`];
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check whether a website slug is available and suggest alternatives if taken.
 */
export async function GET(request: Request) {
  try {
    const rl = rateLimit(`slug-check:${clientKey(request)}`, {
      limit: 30,
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

    const { searchParams } = new URL(request.url);
    const { slug } = querySchema.parse({ slug: searchParams.get("slug") });

    const existing = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      const suggestions: string[] = [];
      for (const candidate of suggestAlternatives(slug)) {
        const taken = await prisma.tenant.findUnique({
          where: { slug: candidate },
          select: { id: true },
        });
        if (!taken) suggestions.push(candidate);
      }
      return jsonOk({ available: false, slug, suggestions });
    }

    return jsonOk({ available: true, slug, suggestions: [] });
  } catch (error) {
    return handleApiError(error);
  }
}
