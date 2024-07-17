import { defineConfig } from "drizzle-kit";

if (!process.env.DB_URL || !process.env.DB_AUTH_TOKEN) {
  throw new Error("DB_URL and DB_AUTH_TOKEN must be set");
}

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_AUTH_TOKEN!,
  },
  dialect: "sqlite",
  driver: "turso",
});
