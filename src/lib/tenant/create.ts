import type { Prisma, PrismaClient } from "@prisma/client";
import { getDefaultTrialWindow } from "@/lib/trial";
import { getRootDomain } from "@/lib/tenant/root-domain";

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Creates an isolated club workspace: tenant, domain, website, home page (draft),
 * membership (OWNER), and configurable trial subscription.
 */
export async function createTenantWorkspace(
  db: DbClient,
  input: {
    clubName: string;
    slug: string;
    ownerUserId: string;
  },
) {
  const { trialStartsAt, trialEndsAt } = await getDefaultTrialWindow(db);

  const tenant = await db.tenant.create({
    data: {
      name: input.clubName,
      slug: input.slug,
    },
  });

  const rootDomain = getRootDomain();
  const hostname = `${input.slug}.${rootDomain}`;

  await db.domain.create({
    data: {
      tenantId: tenant.id,
      hostname,
      isPrimary: true,
      isCustom: false,
      verifiedAt: new Date(),
    },
  });

  const website = await db.website.create({
    data: {
      tenantId: tenant.id,
      name: input.clubName,
      seoTitle: input.clubName,
    },
  });

  const homePage = await db.page.create({
    data: {
      websiteId: website.id,
      tenantId: tenant.id,
      title: "Home",
      path: "/",
      sortOrder: 0,
      status: "DRAFT",
      versions: {
        create: {
          tenantId: tenant.id,
          kind: "DRAFT",
          version: 1,
          content: {
            sections: [
              {
                type: "hero",
                props: {
                  heading: `Welcome to ${input.clubName}`,
                  description: "Your gaming club website starts here.",
                },
              },
            ],
          },
          createdById: input.ownerUserId,
        },
      },
    },
  });

  await db.membership.create({
    data: {
      tenantId: tenant.id,
      userId: input.ownerUserId,
      role: "OWNER",
    },
  });

  const subscription = await db.subscription.create({
    data: {
      tenantId: tenant.id,
      planKey: "trial",
      status: "TRIAL",
      trialStartsAt,
      trialEndsAt,
    },
  });

  await db.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: input.ownerUserId,
      action: "tenant.created",
      meta: { slug: input.slug },
    },
  });

  return { tenant, website, homePage, subscription };
}
