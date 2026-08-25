/**
 * Verifies dynamic subdomain → tenant resolution without exposing tenant IDs in URLs.
 *
 * Run: npx tsx scripts/verify-subdomain-routing.ts
 */
import {
  extractSlugFromHostname,
  resolveHostnameKind,
} from "../src/lib/tenant/hostname";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { createTenantWorkspace } from "../src/lib/tenant/create";
import { resolveTenantFromHost } from "../src/lib/tenant/resolve";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main() {
  // --- Pure hostname parsing ---
  assert(
    extractSlugFromHostname("abc-gaming.localhost:3000", "localhost:3000") ===
      "abc-gaming",
    "local subdomain slug",
  );
  assert(
    extractSlugFromHostname("localhost:3000", "localhost:3000") === null,
    "apex is platform",
  );
  assert(
    extractSlugFromHostname("abc-gaming.yourplatform.com", "yourplatform.com") ===
      "abc-gaming",
    "prod subdomain slug",
  );
  assert(
    resolveHostnameKind("localhost:3000").kind === "platform",
    "platform kind",
  );

  // --- DB lookup via hostname ---
  await prisma.user.deleteMany({
    where: { email: "routing@example.com" },
  });
  await prisma.tenant.deleteMany({ where: { slug: "abc-gaming" } });

  const user = await prisma.user.create({
    data: {
      email: "routing@example.com",
      fullName: "Routing Test",
      passwordHash: await hash("password123", 10),
    },
  });

  const workspace = await createTenantWorkspace(prisma, {
    clubName: "ABC Gaming",
    slug: "abc-gaming",
    ownerUserId: user.id,
  });

  const host = `abc-gaming.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000"}`;
  const resolved = await resolveTenantFromHost(host);

  assert(resolved.kind === "tenant", "hostname should resolve to tenant");
  if (resolved.kind === "tenant") {
    assert(resolved.tenant.slug === "abc-gaming", "slug match");
    assert(
      resolved.tenant.id === workspace.tenant.id,
      "tenant id matched server-side",
    );
  }

  const unknown = await resolveTenantFromHost(
    `missing-club.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000"}`,
  );
  assert(unknown.kind === "unknown_tenant", "unknown slug returns unknown_tenant");

  const platform = await resolveTenantFromHost("localhost:3000");
  assert(platform.kind === "platform", "apex host is platform");

  console.log("PASS: Dynamic subdomain routing verified");
  console.log(`  Hostname ${host} → slug abc-gaming (tenant id server-only)`);
  console.log("  No tenant ID required in browser URL");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
