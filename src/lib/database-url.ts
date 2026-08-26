/**
 * Resolve the database URL for the current runtime.
 *
 * Vercel/serverless cannot reliably use Supabase direct connections (port 5432
 * on db.*.supabase.co). We rewrite to the Supabase Session pooler, which
 * supports Prisma interactive transactions (unlike Transaction mode / 6543).
 *
 * Override order:
 * 1. DATABASE_POOLER_URL — explicit pooler URL (recommended for production)
 * 2. On Vercel: auto-rewrite direct db.*.supabase.co:5432 → session pooler
 * 3. DATABASE_URL as-is (local dev)
 */
export function resolveDatabaseUrl(): string {
  // Never run DB URL resolution in the browser (client bundles must not import db.ts).
  if (typeof window !== "undefined") {
    throw new Error("Database access is server-only");
  }

  const poolerOverride = process.env.DATABASE_POOLER_URL?.trim();
  if (poolerOverride) return normalizePoolParams(poolerOverride);

  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!process.env.VERCEL) {
    return raw;
  }

  if (isSupabasePoolerHost(raw)) {
    return normalizePoolParams(raw);
  }

  const rewritten = rewriteDirectSupabaseToPooler(raw);
  return rewritten ?? normalizePoolParams(raw);
}

function isSupabasePoolerHost(url: string): boolean {
  return url.includes("pooler.supabase.com");
}

/** Drop aggressive connection_limit=1; keep a sane pool timeout for serverless. */
function normalizePoolParams(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("connection_limit");
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "20");
    }
    // Transaction-mode PgBouncer (6543) breaks interactive $transaction (P2028).
    // Prefer session mode on the pooler host when we see 6543.
    if (parsed.port === "6543" && parsed.hostname.includes("pooler.supabase.com")) {
      parsed.port = "5432";
      parsed.searchParams.delete("pgbouncer");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Direct: postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres?...
 * → Session pooler (supports Prisma transactions on Vercel)
 */
function rewriteDirectSupabaseToPooler(url: string): string | null {
  const match = url.match(
    /^postgresql:\/\/postgres:([^@]+)@db\.([a-z0-9-]+)\.supabase\.co:5432(\/[^?]*)?(\?.*)?$/i,
  );
  if (!match) return null;

  const [, password, projectRef, path = "/postgres"] = match;
  const region = process.env.SUPABASE_REGION?.trim() || "ap-south-1";

  return normalizePoolParams(
    `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432${path}`,
  );
}
