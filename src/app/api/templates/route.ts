import type { Prisma } from "@prisma/client";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  TEMPLATE_CATALOG,
  toTemplateConfig,
} from "@/lib/templates/catalog";

/**
 * List templates. If the Template table is empty, seed from the catalog.
 */
export async function GET() {
  try {
    let count = await prisma.template.count();
    if (count === 0) {
      await prisma.template.createMany({
        data: TEMPLATE_CATALOG.map((t) => ({
          key: t.key,
          name: t.name,
          description: t.description,
          config: toTemplateConfig(t) as unknown as Prisma.InputJsonValue,
        })),
        skipDuplicates: true,
      });
    }

    const templates = await prisma.template.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        previewUrl: true,
        updatedAt: true,
      },
    });

    return jsonOk({ templates });
  } catch (error) {
    return handleApiError(error);
  }
}
