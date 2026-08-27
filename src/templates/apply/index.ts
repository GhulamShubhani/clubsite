import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import {
  getCatalogTemplate,
  toTemplateConfig,
  type TemplateConfig,
} from "@/templates/catalog";

function parseConfig(raw: unknown): TemplateConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (!Array.isArray(c.pages) || !c.theme || !Array.isArray(c.navigation)) {
    return null;
  }
  return raw as TemplateConfig;
}

/** Apply a catalog template to a tenant website (theme, nav, published pages). */
export async function applyTemplateToTenant(
  tenantId: string,
  templateKey: string,
  userId: string,
) {
  const dbTemplate = await prisma.template.findUnique({
    where: { key: templateKey },
  });

  let config: TemplateConfig | null = null;
  const catalog = getCatalogTemplate(templateKey);
  if (catalog) {
    config = toTemplateConfig(catalog);
  } else if (dbTemplate) {
    config = parseConfig(dbTemplate.config);
  }
  if (!config) {
    throw new NotFoundError("Template not found");
  }

  const website = await prisma.website.findFirst({
    where: { tenantId },
  });
  if (!website) throw new NotFoundError("Website not found");

  await prisma.website.update({
    where: { id: website.id },
    data: { templateKey },
  });

  await prisma.theme.upsert({
    where: { websiteId: website.id },
    create: {
      websiteId: website.id,
      tenantId,
      tokens: config.theme as Prisma.InputJsonValue,
    },
    update: {
      tokens: config.theme as Prisma.InputJsonValue,
    },
  });

  await prisma.navigation.upsert({
    where: {
      websiteId_key: { websiteId: website.id, key: "main" },
    },
    create: {
      websiteId: website.id,
      tenantId,
      key: "main",
      items: config.navigation as unknown as Prisma.InputJsonValue,
    },
    update: {
      items: config.navigation as unknown as Prisma.InputJsonValue,
    },
  });

  await prisma.page.deleteMany({
    where: { websiteId: website.id, tenantId },
  });

  const createdPages = [];
  for (let i = 0; i < config.pages.length; i++) {
    const p = config.pages[i]!;
    const content = p.content as unknown as Prisma.InputJsonValue;
    const created = await prisma.page.create({
      data: {
        websiteId: website.id,
        tenantId,
        title: p.title,
        path: p.path.startsWith("/") ? p.path : `/${p.path}`,
        sortOrder: i,
        status: "PUBLISHED",
        versions: {
          create: [
            {
              tenantId,
              kind: "DRAFT",
              version: 1,
              content,
              createdById: userId,
            },
            {
              tenantId,
              kind: "PUBLISHED",
              version: 1,
              content,
              publishedAt: new Date(),
              createdById: userId,
            },
          ],
        },
      },
      select: { id: true, title: true, path: true, sortOrder: true },
    });
    createdPages.push(created);
  }

  await prisma.auditLog.create({
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
}
