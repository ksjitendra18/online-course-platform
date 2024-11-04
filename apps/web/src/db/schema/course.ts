import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import {
  chapter,
  chapterLogs,
  courseEnrollment,
  organization,
  purchase,
  quiz,
  quizResponse,
  user,
  videoData,
} from ".";
import { courseCategory } from "./course-category";
import { courseDiscount } from "./course-discount";
import { courseMember } from "./course-member";
import { courseModule, courseModuleLogs } from "./course-modules";
import { discussion } from "./discussion";
import { review } from "./review";

export const course = sqliteTable("course", {
  id: text("id")
    .$defaultFn(() => ulid())
    .primaryKey(),

  organizationId: text("organization_id")
    .references(() => organization.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: integer("price"),
  validity: integer("validity"),
  duration: integer("duration"),
  level: text("level", {
    enum: ["beginner", "intermediate", "advanced"],
  }).notNull(),
  isFree: integer("is_free", { mode: "boolean" }).notNull(),
  status: text("status", {
    enum: ["draft", "published", "archived", "deleted"],
  }).notNull(),
  deletedAt: integer("deleted_at"),
  createdAt: integer("created_at")
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at")
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
});

export const courseLogs = sqliteTable(
  "course_logs",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),
    action: text("action", {
      enum: [
        "create",
        "update",
        "delete",
        "add_member",
        "remove_member",
        "publish",
        "unpublish",
        "discount_created",
        "discount_deleted",
      ],
    }),

    description: text("description"),

    courseId: text("course_id").references(() => course.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
      onUpdate: "set null",
    }),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    courseLogsCourseId: index("course_logs_cid_idx").on(table.courseId),
    courseLogsUserId: index("course_logs_uid_idx").on(table.userId),
  })
);

export const courseRelations = relations(course, ({ many, one }) => ({
  courseCategory: many(courseCategory),
  courseMember: many(courseMember),
  courseModule: many(courseModule),
  organization: one(organization, {
    fields: [course.organizationId],
    references: [organization.id],
  }),
  purchase: many(purchase),
  discussion: many(discussion),
  review: many(review),
  videos: many(videoData),
  chapter: many(chapter),
  enrollment: many(courseEnrollment),
  // discount: many(discount),
  courseDiscount: many(courseDiscount),
  quiz: many(quiz),
  quizResponse: many(quizResponse),
  logs: many(courseLogs),
  moduleLogs: many(courseModuleLogs),
  chapterLogs: many(chapterLogs),
}));

export const courseLogsRelations = relations(courseLogs, ({ one }) => ({
  course: one(course, {
    fields: [courseLogs.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [courseLogs.userId],
    references: [user.id],
  }),
}));

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;
