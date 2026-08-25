import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { AppError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rate-limit";
import { createTenantWorkspace } from "@/lib/tenant/create";

const registerSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  clubName: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
});

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    const rl = rateLimit(`register:${clientKey(request)}`, {
      limit: 5,
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

    const body = await request.json();
    const data = registerSchema.parse(body);

    const email = data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("Email is already registered", 409, "EMAIL_TAKEN");
    }

    const existingSlug = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new AppError("Website address is already taken", 409, "SLUG_TAKEN");
    }

    const passwordHash = await hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          fullName: data.fullName,
          passwordHash,
        },
      });

      const workspace = await createTenantWorkspace(tx, {
        clubName: data.clubName,
        slug: data.slug,
        ownerUserId: user.id,
      });

      return { user, ...workspace };
    });

    await writeAudit({
      tenantId: result.tenant.id,
      userId: result.user.id,
      action: "user.registered",
      meta: { slug: result.tenant.slug },
    });

    return NextResponse.json(
      {
        ok: true,
        userId: result.user.id,
        tenantId: result.tenant.id,
        slug: result.tenant.slug,
        trialEndsAt: result.subscription.trialEndsAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
