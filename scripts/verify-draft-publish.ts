/**
 * Verifies draft edits never appear on the live site until publish.
 *
 * Run: npx tsx scripts/verify-draft-publish.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { createTenantWorkspace } from "../src/lib/tenant/create";
import {
  getPublishedPageByPath,
  publishPage,
  saveDraft,
} from "../src/lib/pages/versions";
import type { TenantContext } from "../src/lib/tenant/access";

const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

async function main() {
  await prisma.user.deleteMany({ where: { email: "publish@example.com" } });
  await prisma.tenant.deleteMany({ where: { slug: "publish-club" } });

  const user = await prisma.user.create({
    data: {
      email: "publish@example.com",
      fullName: "Publish Owner",
      passwordHash: await hash("password123", 10),
    },
  });

  const workspace = await createTenantWorkspace(prisma, {
    clubName: "Publish Club",
    slug: "publish-club",
    ownerUserId: user.id,
  });

  const membership = await prisma.membership.findFirstOrThrow({
    where: { userId: user.id, tenantId: workspace.tenant.id },
  });

  const ctx: TenantContext = {
    user: { id: user.id, email: user.email, fullName: user.fullName },
    tenant: {
      id: workspace.tenant.id,
      name: workspace.tenant.name,
      slug: workspace.tenant.slug,
    },
    membership: {
      id: membership.id,
      role: membership.role,
      tenantId: membership.tenantId,
      userId: membership.userId,
    },
  };

  const pageId = workspace.homePage.id;

  // Initially: draft exists, nothing published for public path
  let live = await getPublishedPageByPath(workspace.tenant.id, "/");
  assert(live === null, "public site empty before first publish");

  // Builder saves draft changes
  await saveDraft(
    pageId,
    {
      sections: [
        {
          type: "hero",
          props: {
            heading: "DRAFT ONLY — should not be live",
            description: "Unpublished edit",
          },
        },
      ],
    },
    ctx,
  );

  live = await getPublishedPageByPath(workspace.tenant.id, "/");
  assert(live === null, "draft save must not create published version");

  // Publish promotes draft → live
  await publishPage(pageId, ctx);

  live = await getPublishedPageByPath(workspace.tenant.id, "/");
  assert(live !== null, "published content available after publish");
  const liveHeading = (
    live!.published.content as {
      sections: Array<{ props: { heading: string } }>;
    }
  ).sections[0].props.heading;
  assert(
    liveHeading === "DRAFT ONLY — should not be live",
    "live shows published draft content",
  );

  // Further draft edits stay off the live site
  await saveDraft(
    pageId,
    {
      sections: [
        {
          type: "hero",
          props: {
            heading: "SECOND DRAFT — still not live",
            description: "Another unpublished edit",
          },
        },
      ],
    },
    ctx,
  );

  live = await getPublishedPageByPath(workspace.tenant.id, "/");
  const stillLiveHeading = (
    live!.published.content as {
      sections: Array<{ props: { heading: string } }>;
    }
  ).sections[0].props.heading;
  assert(
    stillLiveHeading === "DRAFT ONLY — should not be live",
    "second draft must not overwrite live until publish",
  );

  await publishPage(pageId, ctx);
  live = await getPublishedPageByPath(workspace.tenant.id, "/");
  const afterSecondPublish = (
    live!.published.content as {
      sections: Array<{ props: { heading: string } }>;
    }
  ).sections[0].props.heading;
  assert(
    afterSecondPublish === "SECOND DRAFT — still not live",
    "second publish updates live site",
  );

  const historyCount = await prisma.pageVersion.count({
    where: { pageId, kind: "HISTORY", tenantId: workspace.tenant.id },
  });
  assert(historyCount >= 1, "previous published snapshot stored as HISTORY");

  console.log("PASS: Draft / published separation verified");
  console.log("  Builder saves affect DRAFT only");
  console.log("  Public site reads PUBLISHED only");
  console.log("  Publish promotes draft → live");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
