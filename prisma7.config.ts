// Configuración de Prisma 7: define el generator (output, provider)
// y el datasource (url). Reemplaza el bloque que antes estaba en schema.prisma.   
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});   