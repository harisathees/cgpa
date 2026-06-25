// Prisma configuration (Prisma 7+).
// Loads env vars from .env so the Prisma CLI can read the connection string.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Used by the CLI (migrate / introspect). The runtime client uses the same
  // DATABASE_URL via the MariaDB driver adapter (see src/prisma/prisma.service.ts).
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
