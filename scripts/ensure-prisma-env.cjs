/** Ensures DIRECT_URL exists for Prisma generate (falls back to DATABASE_URL). */
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
