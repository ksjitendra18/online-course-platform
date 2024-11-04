import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { course } from "./course";
import { discount } from "./discount";

export const courseDiscount = sqliteTable(
  "course_discount",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),
    courseId: text("course_id")
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    discountId: text("discount_id")
      .references(() => discount.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  (table) => ({
    courseDiscountCourseIdIdx: index("course_discount_course_id_idx").on(
      table.courseId
    ),

    courseDiscountDiscountIdIdx: index("course_discount_discount_id_idx").on(
      table.discountId
    ),
  })
);

export const courseDiscountRelations = relations(courseDiscount, ({ one }) => ({
  course: one(course, {
    fields: [courseDiscount.courseId],
    references: [course.id],
  }),
  discount: one(discount, {
    fields: [courseDiscount.discountId],
    references: [discount.id],
  }),
}));

export type CourseDiscount = typeof courseDiscount.$inferSelect;
