import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { user } from "./auth";
import { course } from "./course";

export const review = sqliteTable(
  "review",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),
    text: text("text"),
    rating: integer("rating").notNull(),
    isHighlighted: integer("is_highlighted", { mode: "boolean" }).default(
      false
    ),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    isFlagged: integer("is_flagged", { mode: "boolean" }).default(false),

    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    reviewCourseIdIdx: index("review_course_id_idx").on(table.courseId),
    rviewUsrCourseIdx: uniqueIndex("rview_user_crs_idx").on(
      table.courseId,
      table.userId
    ),
  })
);

export const reviewRelations = relations(review, ({ one }) => ({
  course: one(course, {
    fields: [review.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));
