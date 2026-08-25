import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  getCatalogTemplate,
  toTemplateConfig,
  type TemplateConfig,
} from "@/lib/templates/catalog";

function parseConfig(raw: unknown): TemplateConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (!Array.isArray(c.pages) || !c.theme || !Array.isArray(c.navigation)) {
    return null;
  }
  return raw as TemplateConfig;
}

/**
 * Apply a template to a tenant website.
 * Caller must enforce EDITOR+ access before invoking.
 * Always scoped to the given tenantId.
 */
export async function applyTemplateToTenant(
  tenantId: string,
  templateKey: string,
  userId: string,
) {
  const dbTemplate = await prisma.template.findUnique({
    where: { key: templateKey },
  });

  let config: TemplateConfig | null = null;
  if (dbTemplate) {
    config = parseConfig(dbTemplate.config);
  }
  if (!config) {
    const catalog = getCatalogTemplate(templateKey);
    if (!catalog) throw new NotFoundError("Template not found");
    config = toTemplateConfig(catalog);
  }

  const website = await prisma.website.findFirst({
    where: { tenantId },
  });
  if (!website) throw new NotFoundError("Website not found");

  return prisma.$transaction(async (tx) => {
    await tx.website.update({
      where: { id: website.id },
      data: { templateKey },
    });

    await tx.theme.upsert({
      where: { websiteId: website.id },
      create: {
        websiteId: website.id,
        tenantId,
        tokens: config!.theme as Prisma.InputJsonValue,
      },
      update: {
        tokens: config!.theme as Prisma.InputJsonValue,
      },
    });

    await tx.navigation.upsert({
      where: {
        websiteId_key: { websiteId: website.id, key: "main" },
      },
      create: {
        websiteId: website.id,
        tenantId,
        key: "main",
        items: config!.navigation as unknown as Prisma.InputJsonValue,
      },
      update: {
        items: config!.navigation as unknown as Prisma.InputJsonValue,
      },
    });

    // Cascade deletes PageVersion rows.
    await tx.page.deleteMany({
      where: { websiteId: website.id, tenantId },
    });

    const createdPages = [];
    for (let i = 0; i < config!.pages.length; i++) {
      const p = config!.pages[i]!;
      const created = await tx.page.create({
        data: {
          websiteId: website.id,
          tenantId,
          title: p.title,
          path: p.path.startsWith("/") ? p.path : `/${p.path}`,
          sortOrder: i,
          status: "DRAFT",
          versions: {
            create: {
              tenantId,
              kind: "DRAFT",
              version: 1,
              content: p.content as unknown as Prisma.InputJsonValue,
              createdById: userId,
            },
          },
        },
        select: { id: true, title: true, path: true, sortOrder: true },
      });
      createdPages.push(created);
    }

    await tx.auditLog.create({
      data: {
        tenantId,
        userId,
        action: "template.applied",
        meta: { templateKey, pageCount: createdPages.length },
      },
    });

    return {
      ok: true as const,
      templateKey,
      pages: createdPages,
    };
  });
}
