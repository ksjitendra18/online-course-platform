import { env } from "@/utils/env/server";
import { defineConfig } from "drizzle-kit";

if (!env.DB_URL || !env.DB_AUTH_TOKEN) {
  throw new Error("DB_URL and DB_AUTH_TOKEN must be set");
}

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dbCredentials: {
    url: env.DB_URL!,
    authToken: env.DB_AUTH_TOKEN!,
  },
  dialect: "sqlite",
  driver: "turso",
});
