function stripPort(host: string): string {
  return host.replace(/:\d+$/, "").toLowerCase();
}

/**
 * Platform root domain for subdomain routing.
 * On Vercel, falls back to auto-injected URLs when NEXT_PUBLIC_ROOT_DOMAIN is unset.
 */
export function getRootDomain(): string {
  const explicit = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (explicit) return explicit;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return production;

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return deployment;

  return "localhost:3000";
}

/** True when the host is the platform site (not a club subdomain or custom domain). */
export function isPlatformHost(host: string, rootDomain = getRootDomain()): boolean {
  const normalized = stripPort(host);
  const root = stripPort(rootDomain);

  if (normalized === root || normalized === `www.${root}`) {
    return true;
  }

  // Preview / branch deployment URLs on Vercel are platform hosts, not clubs.
  for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL"] as const) {
    const vercelHost = process.env[key]?.trim();
    if (vercelHost && normalized === stripPort(vercelHost)) {
      return true;
    }
  }

  return false;
}

export { stripPort };
