import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index";

if (!process.env.DB_URL) {
  throw new Error("DB URL is missing");
}

const client = createClient({
  url: process.env.DB_URL,
  authToken: process.env.DB_AUTH_TOKEN,
});

export const db = drizzle(client, { schema, logger: false });
