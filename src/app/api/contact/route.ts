import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, jsonOk } from "@/lib/api";
import { AppError, NotFoundError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { requireTenantAccess } from "@/lib/tenant/access";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { resolveTenantFromSlug } from "@/lib/tenant/resolve-by-slug";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  formTitle: z.string().max(120).optional(),
  message: z.string().min(1).max(5000),
  slug: z.string().max(80).optional(),
});

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function slugFromReferer(request: Request) {
  const referer = request.headers.get("referer") ?? "";
  try {
    const url = new URL(referer);
    const match = url.pathname.match(/^\/club\/([^/]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
  return undefined;
}

async function resolvePublicTenant(request: Request, slug?: string) {
  const fromQuery = slug?.trim().toLowerCase() || slugFromReferer(request);
  if (fromQuery) {
    return resolveTenantFromSlug(fromQuery);
  }

  const resolved = await resolveTenantFromHost(request.headers.get("host"));
  if (resolved.kind === "tenant") {
    return resolved.tenant;
  }

  try {
    const ctx = await requireTenantAccess({ minRole: "VIEWER" });
    return ctx.tenant;
  } catch {
    throw new NotFoundError("Club website not found");
  }
}

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`contact:${clientKey(request)}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again.", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      throw new AppError("Please check the form and try again.", 400, "VALIDATION");
    }
    const body = contactSchema.parse(json);
    const tenant = await resolvePublicTenant(request, body.slug);
    const phone = body.phone?.trim() || null;
    const formTitle = body.formTitle?.trim() || null;

    await prisma.contactSubmission.create({
      data: {
        tenantId: tenant.id,
        name: body.name,
        email: body.email,
        phone,
        formTitle,
        message: body.message,
      },
    });

    return jsonOk({ ok: true }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
