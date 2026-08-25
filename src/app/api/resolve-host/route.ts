import { NextResponse } from "next/server";
import { resolveTenantFromHost } from "@/lib/tenant/resolve";
import { handleApiError, jsonOk } from "@/lib/api";

/**
 * Public debug/resolution endpoint: identifies the club from the Host header only.
 * Does not accept tenantId from the client.
 */
export async function GET(request: Request) {
  try {
    const host = request.headers.get("host");
    const result = await resolveTenantFromHost(host);

    if (result.kind === "platform") {
      return jsonOk({ kind: "platform", host });
    }

    if (result.kind === "unknown_tenant") {
      return NextResponse.json(
        { kind: "unknown_tenant", host, slug: result.resolution.kind === "tenant" ? result.resolution.slug : null },
        { status: 404 },
      );
    }

    // Intentionally omit raw internal ids from public payload if desired;
    // admin APIs can include id after auth. Public site only needs slug.
    return jsonOk({
      kind: "tenant",
      host,
      slug: result.tenant.slug,
      name: result.tenant.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
