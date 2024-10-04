import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { courseCategory } from "./course-category";

export const category = sqliteTable("category", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  courseCategory: many(courseCategory),
}));

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
