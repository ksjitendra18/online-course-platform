import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_AUTH_TOKEN!,
  },

  driver: "turso",
} satisfies Config;
