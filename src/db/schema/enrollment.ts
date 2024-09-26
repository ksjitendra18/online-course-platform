import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { course } from "./course";

export const courseEnrollment = sqliteTable(
  "course_enrollment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
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

    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    ceUIdCIdx: uniqueIndex("course_enrollment_user_course_id_idx").on(
      table.courseId,
      table.userId
    ),
    enrollUserIdx: index("course_enrollment_user_id_idx").on(table.userId),
    enrollCourseIdx: index("course_enrollment_course_id_idx").on(
      table.courseId
    ),
  })
);

export const courseEnrollmentRelations = relations(
  courseEnrollment,
  ({ one }) => ({
    user: one(user, {
      fields: [courseEnrollment.userId],
      references: [user.id],
    }),
    course: one(course, {
      fields: [courseEnrollment.courseId],
      references: [course.id],
    }),
  })
);

export type CourseEnrollment = typeof courseEnrollment.$inferSelect; // return type when queried
