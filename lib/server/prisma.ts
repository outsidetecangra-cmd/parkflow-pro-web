import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __parkflowPrisma: PrismaClient | undefined;
}

export function getPrismaClient() {
  if (!globalThis.__parkflowPrisma) {
    globalThis.__parkflowPrisma = new PrismaClient();
  }

  return globalThis.__parkflowPrisma;
}

