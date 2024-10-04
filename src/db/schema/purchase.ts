import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from ".";
import { course } from "./course";

export const purchase = sqliteTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id").notNull(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    coursePrice: integer("price").notNull(),
    discountUsed: integer("discount_used", { mode: "boolean" })
      .default(false)
      .notNull(),
    discountPercent: integer("discount_percent").default(0).notNull(),
    discountCode: text("discount_code"),
    razorpayOrderId: text("razorpay_order_id").notNull(),
    razorpayPaymentId: text("razorpay_payment_id").notNull(),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => {
    return {
      purchaseCourseIdIdx: index("purchase_course_id_idx").on(table.courseId),
      purchaseUIdCIdKey: uniqueIndex("purchase_user_course_id_idx").on(
        table.userId,
        table.courseId
      ),
    };
  }
);

export const purchaseRelations = relations(purchase, ({ one }) => ({
  course: one(course, {
    fields: [purchase.courseId],
    references: [course.id],
  }),

  user: one(user, {
    fields: [purchase.userId],
    references: [user.id],
  }),
}));

export type Purchase = typeof purchase.$inferSelect; // return type when queried
export type NewPurchase = typeof purchase.$inferInsert;
