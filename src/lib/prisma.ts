import { PrismaClient } from "@prisma/client";

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
                throw new Error("Database is running in serverless edge mode.");
              };
            },
          }
        );
      },
    }
  );
}

function makePrismaClient(): any {
  try {
    // Hanya gunakan PrismaClient di lingkungan Node.js murni (misal build time atau local server)
    if (
      typeof process !== "undefined" &&
      process.release &&
      process.release.name === "node" &&
      typeof window === "undefined"
    ) {
      return new PrismaClient();
    }
  } catch (err) {
    console.warn("PrismaClient initialization fallback:", err);
  }
  return createSafeFallbackProxy();
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
