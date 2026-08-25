import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { NotFoundError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Public contact form endpoint. MVP: validates + acknowledges; no email send.
 */
export async function POST(request: Request) {
  try {
    const rl = rateLimit(`contact:${clientKey(request)}`, {
      limit: 10,
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

    const body = contactSchema.parse(await request.json());
    const resolved = await resolveTenantFromHost(request.headers.get("host"));
    if (resolved.kind !== "tenant") {
      throw new NotFoundError("Club website not found");
    }

    // MVP: accept submission; persistence/email can be added later.
    void body;
    void resolved;

    return jsonOk({ ok: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
