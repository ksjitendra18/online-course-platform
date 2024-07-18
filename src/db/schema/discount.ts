import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { course } from ".";

export const discount = sqliteTable(
  "discount",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    code: text("code").unique().notNull(),
    percent: integer("percent").notNull(),
    courseId: text("course_id").references(() => course.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    isGlobal: integer("is_global", { mode: "boolean" }).notNull(),
    usageLimit: integer("usage_limit").notNull(),
    validTill: text("valid_till").notNull(),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    disCourseIdIdx: index("dis_course_id_idx").on(table.courseId),
  })
);

export const discountRelations = relations(discount, ({ many, one }) => ({
  course: one(course, {
    fields: [discount.courseId],
    references: [course.id],
  }),
}));

export type Discount = typeof discount.$inferSelect;
export type NewDiscount = typeof discount.$inferInsert;
