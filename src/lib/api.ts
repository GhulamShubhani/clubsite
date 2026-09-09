import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

function isDatabasePaused(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = String((error as { message?: string }).message ?? "");
  return /tenant\/user .+ not found/i.test(msg);
}

function isDatabaseUnreachable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { name?: string; code?: string; message?: string };
  if (err.name === "PrismaClientInitializationError") return true;
  if (err.code === "P1001" || err.code === "P1017" || err.code === "P1000") {
    return true;
  }
  return /Can't reach database server/i.test(String(err.message ?? ""));
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const first = error.issues[0]?.message ?? "Please check the form and try again.";
    return NextResponse.json(
      { error: first, code: "VALIDATION" },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (isDatabaseUnreachable(error)) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Can't connect right now. Please try again in a moment.",
        code: "DB_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
  if (isDatabasePaused(error)) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          "The database is paused. Open Supabase, click Restore, wait a minute, then try again.",
        code: "DB_PAUSED",
      },
      { status: 503 },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again.", code: "INTERNAL" },
    { status: 500 },
  );
}
