import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { AppError, NotFoundError } from "@/lib/errors";
import {
  assertSameTenant,
  requireTenantAccess,
  tenantScope,
  type TenantContext,
} from "@/lib/tenant/access";
import { getTenantTrial } from "@/lib/trial";

export type PageContent = Prisma.JsonValue;

/**
 * Load the draft configuration for the visual builder / preview.
 * Never returns the published snapshot as the editable document.
 */
export async function getDraftContent(pageId: string, ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "VIEWER" }));

  const page = await prisma.page.findFirst({
    where: { id: pageId, ...tenantScope(access) },
    include: {
      versions: {
        where: { kind: "DRAFT" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!page) throw new NotFoundError("Page not found");
  assertSameTenant(access, page.tenantId, "Page");

  const draft = page.versions[0];
  if (!draft) throw new NotFoundError("Draft version not found");

  return {
    page: {
      id: page.id,
      title: page.title,
      path: page.path,
      status: page.status,
    },
    draft: {
      id: draft.id,
      version: draft.version,
      content: draft.content,
      updatedAt: draft.createdAt,
    },
  };
}

/**
 * Persist builder edits to the DRAFT version only.
 * The public live site is unaffected until publish().
 */
export async function saveDraft(
  pageId: string,
  content: PageContent,
  ctx?: TenantContext,
) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "EDITOR" }));

  const page = await prisma.page.findFirst({
    where: { id: pageId, ...tenantScope(access) },
  });
  if (!page) throw new NotFoundError("Page not found");
  assertSameTenant(access, page.tenantId, "Page");

  const existingDraft = await prisma.pageVersion.findFirst({
    where: {
      pageId: page.id,
      kind: "DRAFT",
      ...tenantScope(access),
    },
    orderBy: { version: "desc" },
  });

  if (existingDraft) {
    const updated = await prisma.pageVersion.update({
      where: { id: existingDraft.id },
      data: {
        content: content as Prisma.InputJsonValue,
        createdById: access.user.id,
      },
    });
    return { draft: updated, created: false as const };
  }

  const created = await prisma.pageVersion.create({
    data: {
      pageId: page.id,
      tenantId: access.tenant.id,
      kind: "DRAFT",
      version: 1,
      content: content as Prisma.InputJsonValue,
      createdById: access.user.id,
    },
  });

  return { draft: created, created: true as const };
}

/**
 * Promote the current draft to the live published version.
 * - Writes a HISTORY snapshot of the previous published content (if any)
 * - Upserts the PUBLISHED version from draft
 * - Leaves the DRAFT intact for further editing
 * - Public site only reads PUBLISHED
 */
export async function publishPage(pageId: string, ctx?: TenantContext) {
  const access = ctx ?? (await requireTenantAccess({ minRole: "EDITOR" }));

  const trial = await getTenantTrial(prisma, access.tenant.id);
  if (trial?.blocksPublishing) {
    throw new AppError(
      "Trial expired. Upgrade to publish changes. Your draft and website data are still saved.",
      402,
      "TRIAL_EXPIRED",
    );
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, ...tenantScope(access) },
    include: {
      versions: {
        where: { kind: { in: ["DRAFT", "PUBLISHED"] } },
        orderBy: { version: "desc" },
      },
    },
  });

  if (!page) throw new NotFoundError("Page not found");
  assertSameTenant(access, page.tenantId, "Page");

  const draft = page.versions.find((v) => v.kind === "DRAFT");
  if (!draft) {
    throw new AppError("Nothing to publish — draft is missing", 400, "NO_DRAFT");
  }

  const currentPublished = page.versions.find((v) => v.kind === "PUBLISHED");

  // Sequential writes — avoid interactive $transaction (breaks on Supabase PgBouncer / Vercel).
  let result: {
    published: {
      id: string;
      version: number;
      content: Prisma.JsonValue;
      publishedAt: Date | null;
    };
    fromDraftVersion: number;
  };

  if (currentPublished) {
    const lastHistory = await prisma.pageVersion.findFirst({
      where: {
        pageId: page.id,
        kind: "HISTORY",
        ...tenantScope(access),
      },
      orderBy: { version: "desc" },
    });

    await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        tenantId: access.tenant.id,
        kind: "HISTORY",
        version: (lastHistory?.version ?? 0) + 1,
        content: currentPublished.content as Prisma.InputJsonValue,
        publishedAt: currentPublished.publishedAt,
        createdById: access.user.id,
      },
    });

    const published = await prisma.pageVersion.update({
      where: { id: currentPublished.id },
      data: {
        content: draft.content as Prisma.InputJsonValue,
        version: currentPublished.version + 1,
        publishedAt: new Date(),
        createdById: access.user.id,
      },
    });

    await prisma.page.update({
      where: { id: page.id },
      data: { status: "PUBLISHED" },
    });

    result = { published, fromDraftVersion: draft.version };
  } else {
    const published = await prisma.pageVersion.create({
      data: {
        pageId: page.id,
        tenantId: access.tenant.id,
        kind: "PUBLISHED",
        version: 1,
        content: draft.content as Prisma.InputJsonValue,
        publishedAt: new Date(),
        createdById: access.user.id,
      },
    });

    await prisma.page.update({
      where: { id: page.id },
      data: { status: "PUBLISHED" },
    });

    result = { published, fromDraftVersion: draft.version };
  }

  await prisma.auditLog.create({
    data: {
      tenantId: access.tenant.id,
      userId: access.user.id,
      action: "page.published",
      meta: { pageId, publishedVersion: result.published.version },
    },
  });

  return result;
}

/**
 * Public renderer: load PUBLISHED content only for a tenant + path.
 * Draft edits are invisible here until publish.
 */
export async function getPublishedPageByPath(
  tenantId: string,
  path: string,
) {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  const page = await prisma.page.findFirst({
    where: {
      tenantId,
      path: normalized,
      status: "PUBLISHED",
    },
    include: {
      versions: {
        where: { kind: "PUBLISHED" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!page || !page.versions[0]) {
    return null;
  }

  return {
    page: {
      id: page.id,
      title: page.title,
      path: page.path,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
    },
    published: {
      version: page.versions[0].version,
      content: page.versions[0].content,
      publishedAt: page.versions[0].publishedAt,
    },
  };
}
