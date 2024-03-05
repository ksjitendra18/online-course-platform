import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { courseCategory } from "./course-category";

export const category = sqliteTable("category", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  courseCategory: many(courseCategory),
}));
// export const categoryRelations = relations(category, ({ many }) => ({
//   course: many(course),
// }));

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
