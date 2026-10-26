import { PrismaClient } from "@prisma/client";

// Fallback seguro de banco de dados caso DATABASE_URL não esteja nas variáveis de ambiente do sistema
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
