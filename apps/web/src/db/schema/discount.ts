import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { courseDiscount } from "./course-discount";

export const discount = sqliteTable("discount", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  code: text("code").notNull(),
  type: text("type", { enum: ["value", "percent"] }).notNull(),
  discountValue: integer("discount_value").notNull(),
  usageLimit: integer("usage_limit"),
  currentUsage: integer("current_usage").default(0).notNull(),
  activeFrom: integer("active_from").notNull(),
  validTill: integer("valid_till"),
  isGlobal: integer("is_global", { mode: "boolean" }).default(false).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
});

export const discountRelations = relations(discount, ({ many }) => ({
  courseDiscount: many(courseDiscount),
}));

export type Discount = typeof discount.$inferSelect;
export type NewDiscount = typeof discount.$inferInsert;
