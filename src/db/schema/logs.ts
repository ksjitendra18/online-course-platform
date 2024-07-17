import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const logs = sqliteTable("logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  type: text("type").notNull(),
  ip: text("ip").notNull(),
  deviceFingerprint: text("device_fingerprint"),
  info: text("info"),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
});
