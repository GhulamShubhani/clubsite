import { headers } from "next/headers";
import { TENANT_HEADERS } from "@/lib/tenant/hostname";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";

/**
 * Server-only helper: read host headers set by middleware and resolve tenant from DB.
 * Uses hostname even when slug is missing/custom (custom domains).
 */
export async function getRequestTenant() {
  const h = await headers();
  const host =
    h.get(TENANT_HEADERS.hostname) ?? h.get("host") ?? null;
  const kind = h.get(TENANT_HEADERS.kind);

  if (kind === "platform" || !host) {
    return { kind: "platform" as const };
  }

  return resolveTenantFromHost(host);
}
