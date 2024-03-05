import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { category } from "./category";

export const courseCategory = sqliteTable(
  "course_category",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => course.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.courseId, table.categoryId] }),
    };
  }
);

export const courseToCategoryRelations = relations(
  courseCategory,
  ({ one }) => ({
    category: one(category, {
      fields: [courseCategory.categoryId],
      references: [category.id],
    }),
    course: one(course, {
      fields: [courseCategory.courseId],
      references: [course.id],
    }),
  })
);
