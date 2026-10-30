import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

function createSafeFallbackProxy(): any {
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === "then") return undefined;
        return new Proxy(
          {},
          {
            get(target2, method) {
              return async () => {
                throw new Error("Local SQLite database is offline on Cloudflare serverless edge.");
              };
            },
          }
        );
      },
    }
  );
}

function makePrismaClient(): any {
  const dbUrl = process.env.DATABASE_URL;

  // Jika di Cloudflare Worker dan tidak ada database URL remote (misal libsql:// atau https://)
  if (!dbUrl || dbUrl.startsWith("file:")) {
    try {
      // Hanya inisialisasi PrismaClient standar jika benar-benar di lingkungan runtime Node.js lokal
      if (typeof process !== "undefined" && process.release && process.release.name === "node") {
        return new PrismaClient();
      }
    } catch {
      // Abaikan dan gunakan safe proxy
    }
    return createSafeFallbackProxy();
  }

  try {
    const adapter = new PrismaLibSql({ url: dbUrl });
    return new PrismaClient({ adapter });
  } catch (err) {
    console.warn("PrismaLibSql initialization caught:", err);
    try {
      return new PrismaClient();
    } catch {
      return createSafeFallbackProxy();
    }
  }
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
