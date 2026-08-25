import { NextResponse, type NextRequest } from "next/server";
import {
  resolveHostnameKind,
  TENANT_HEADERS,
} from "@/lib/tenant/hostname";

/**
 * Dynamic subdomain + custom-domain routing:
 * - Platform: localhost:3000 / yourplatform.com
 * - Club site: {slug}.localhost:3000 / {slug}.yourplatform.com
 * - Custom: club.example.com (resolved via Domain table server-side)
 *
 * Middleware only attaches kind/slug/hostname headers.
 * Tenant ID lookup happens server-side from the database — never exposed in the URL.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const rootDomain =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  const resolution = resolveHostnameKind(host, rootDomain);
  const requestHeaders = new Headers(request.headers);

  if (resolution.kind === "tenant") {
    requestHeaders.set(TENANT_HEADERS.kind, "tenant");
    requestHeaders.set(TENANT_HEADERS.slug, resolution.slug);
    requestHeaders.set(TENANT_HEADERS.hostname, host.toLowerCase());
  } else {
    requestHeaders.set(TENANT_HEADERS.kind, "platform");
    requestHeaders.delete(TENANT_HEADERS.slug);
    requestHeaders.delete(TENANT_HEADERS.hostname);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
