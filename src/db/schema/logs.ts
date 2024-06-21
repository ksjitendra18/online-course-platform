import { createId } from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const logs = sqliteTable("logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  type: text("type").notNull(),
  ip: text("ip").notNull(),
  deviceFingerprint: text("device_fingerprint"),
  info: text("info"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
