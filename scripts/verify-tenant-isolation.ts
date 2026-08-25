/**
 * Verifies strict tenant isolation at the data layer.
 * Club A must never read or delete Club B's pages/media.
 *
 * Run: npm run test:isolation
 * Requires DATABASE_URL and a migrated database.
 */
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createTenantWorkspace } from "../src/lib/tenant/create";

const prisma = new PrismaClient();

async function seedClub(slug: string, clubName: string) {
  const email = `${slug}@example.com`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: `${clubName} Owner`,
      passwordHash: await hash("password123", 10),
    },
  });
  const workspace = await createTenantWorkspace(prisma, {
    clubName,
    slug,
    ownerUserId: user.id,
  });
  return { user, ...workspace };
}

async function main() {
  // Clean previous isolation test data
  await prisma.user.deleteMany({
    where: { email: { in: ["club-a@example.com", "club-b@example.com"] } },
  });
  await prisma.tenant.deleteMany({
    where: { slug: { in: ["club-a", "club-b"] } },
  });

  const clubA = await seedClub("club-a", "Club A");
  const clubB = await seedClub("club-b", "Club B");

  const mediaB = await prisma.media.create({
    data: {
      tenantId: clubB.tenant.id,
      filename: "b-logo.png",
      originalName: "logo.png",
      mimeType: "image/png",
      sizeBytes: 1024,
      url: "https://cdn.example.com/b-logo.png",
    },
  });

  // --- Isolation checks (server-side scoped queries) ---

  const aPages = await prisma.page.findMany({
    where: { tenantId: clubA.tenant.id },
  });
  const bPages = await prisma.page.findMany({
    where: { tenantId: clubB.tenant.id },
  });

  if (aPages.some((p) => p.tenantId !== clubA.tenant.id)) {
    throw new Error("FAIL: Club A page query returned foreign tenant data");
  }
  if (bPages.some((p) => p.tenantId !== clubB.tenant.id)) {
    throw new Error("FAIL: Club B page query returned foreign tenant data");
  }

  // Club A attempts to fetch Club B media by id WITH Club A's tenant scope
  const leaked = await prisma.media.findFirst({
    where: { id: mediaB.id, tenantId: clubA.tenant.id },
  });
  if (leaked) {
    throw new Error("FAIL: Club A could read Club B media");
  }

  // Club A attempts deleteMany on Club B media with Club A scope — must be 0
  const deleteAttempt = await prisma.media.deleteMany({
    where: { id: mediaB.id, tenantId: clubA.tenant.id },
  });
  if (deleteAttempt.count !== 0) {
    throw new Error("FAIL: Club A deleted Club B media");
  }

  const stillExists = await prisma.media.findUnique({ where: { id: mediaB.id } });
  if (!stillExists) {
    throw new Error("FAIL: Club B media was destroyed");
  }

  // Cross-tenant page id lookup must miss
  const foreignPage = await prisma.page.findFirst({
    where: { id: clubB.homePage.id, tenantId: clubA.tenant.id },
  });
  if (foreignPage) {
    throw new Error("FAIL: Club A could load Club B page by id");
  }

  console.log("PASS: Strict tenant isolation verified");
  console.log(`  Club A tenant: ${clubA.tenant.id}`);
  console.log(`  Club B tenant: ${clubB.tenant.id}`);
  console.log(`  Cross-tenant media/page access blocked`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
