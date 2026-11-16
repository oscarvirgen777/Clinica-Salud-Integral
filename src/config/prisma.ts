import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


// Crea el adapter con la connection string de PostgreSQL.
// El `!` es una aserción de no-null: TypeScript no sabe que DATABASE_URL
// siempre estará definida, así que le decimos "confía, no es undefined".
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// PATRÓN SINGLETON con globalThis:
// En desarrollo, nodemon / hot-reload recarga módulos constantemente.
// Si cada recarga creara un PrismaClient nuevo, se agotarían las
// conexiones a PostgreSQL ("Too many connections").
// Guardar la instancia en globalThis la persiste entre recargas.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Si ya existe una instancia (reload), la reutiliza.
// Si no (primera carga), crea una nueva con el adapter.
export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });
// Solo en desarrollo se guarda la instancia en global.
// En producción el proceso no se recarga, así que no hace falta.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;   