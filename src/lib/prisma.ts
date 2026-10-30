import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient(): PrismaClient {
  try {
    const dbUrl = process.env.DATABASE_URL || "file:dev.db";
    const adapter = new PrismaLibSql({
      url: dbUrl,
    });

    return new PrismaClient({
      adapter,
    });
  } catch (err) {
    console.warn("PrismaLibSql initialization caught:", err);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
