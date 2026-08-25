/**
 * Resolve the database URL for the current runtime.
 *
 * Vercel/serverless cannot reliably use Supabase direct connections (port 5432).
 * When deployed on Vercel with a direct Supabase URL, we rewrite to the
 * Transaction pooler (port 6543) automatically.
 *
 * Override order:
 * 1. DATABASE_POOLER_URL — explicit pooler URL (recommended for production)
 * 2. On Vercel: auto-rewrite direct db.*.supabase.co:5432 → pooler
 * 3. DATABASE_URL as-is (local dev)
 */
export function resolveDatabaseUrl(): string {
  // Never run DB URL resolution in the browser (client bundles must not import db.ts).
  if (typeof window !== "undefined") {
    throw new Error("Database access is server-only");
  }

  const poolerOverride = process.env.DATABASE_POOLER_URL?.trim();
  if (poolerOverride) return poolerOverride;

  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!process.env.VERCEL) {
    return raw;
  }

  if (isSupabasePoolerUrl(raw)) {
    return raw;
  }

  const rewritten = rewriteDirectSupabaseToPooler(raw);
  return rewritten ?? raw;
}

function isSupabasePoolerUrl(url: string): boolean {
  return (
    url.includes("pooler.supabase.com") ||
    /:6543[/?]/.test(url) ||
    url.includes("pgbouncer=true")
  );
}

/** Direct: postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres?... */
function rewriteDirectSupabaseToPooler(url: string): string | null {
  const match = url.match(
    /^postgresql:\/\/postgres:([^@]+)@db\.([a-z0-9-]+)\.supabase\.co:5432(\/[^?]*)?(\?.*)?$/i,
  );
  if (!match) return null;

  const [, password, projectRef, path = "/postgres", query = ""] = match;
  const region = process.env.SUPABASE_REGION?.trim() || "ap-south-1";

  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  params.set("pgbouncer", "true");
  params.set("connection_limit", "1");
  if (!params.has("sslmode")) {
    params.set("sslmode", "require");
  }

  const qs = params.toString();
  return `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543${path}${qs ? `?${qs}` : ""}`;
}
