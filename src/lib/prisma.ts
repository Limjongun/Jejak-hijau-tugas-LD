import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "file:dev.db";
  const adapter = new PrismaLibSql({
    url: dbUrl,
  });

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
