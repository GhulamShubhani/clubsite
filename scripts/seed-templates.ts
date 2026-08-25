/**
 * Upsert all catalog templates into the Template table.
 *
 * Run: npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import {
  TEMPLATE_CATALOG,
  toTemplateConfig,
} from "../src/lib/templates/catalog";

const prisma = new PrismaClient();

async function main() {
  for (const t of TEMPLATE_CATALOG) {
    await prisma.template.upsert({
      where: { key: t.key },
      create: {
        key: t.key,
        name: t.name,
        description: t.description,
        config: toTemplateConfig(t) as unknown as Prisma.InputJsonValue,
      },
      update: {
        name: t.name,
        description: t.description,
        config: toTemplateConfig(t) as unknown as Prisma.InputJsonValue,
      },
    });
    console.log(`upserted template: ${t.key}`);
  }
  console.log(`Done. ${TEMPLATE_CATALOG.length} templates.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
