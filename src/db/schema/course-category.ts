import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { category } from "./category";
import { course } from "./course";

export const courseCategory = sqliteTable(
  "course_category",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.courseId, table.categoryId] }),
    };
  }
);

export const courseCategoryRelations = relations(courseCategory, ({ one }) => ({
  category: one(category, {
    fields: [courseCategory.categoryId],
    references: [category.id],
  }),
  course: one(course, {
    fields: [courseCategory.courseId],
    references: [course.id],
  }),
}));
