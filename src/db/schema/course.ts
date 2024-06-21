import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { category } from "./category";
import { courseModule } from "./course-modules";
import { courseCategory } from "./course-category";
import { courseMember } from "./course-member";
import {
  chapter,
  courseEnrollment,
  discount,
  organization,
  purchase,
  quiz,
  quizResponse,
  videoData,
  user,
} from ".";
import { discussion } from "./discussion";
import { review } from "./review";

export const course = sqliteTable("course", {
  id: text("id")
    .$defaultFn(() => createId())
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
  validity: integer("validity").default(0),
  isPublished: integer("is_published", { mode: "boolean" })
    .default(false)
    .notNull(),
  duration: integer("duration"),
  level: text("level", {
    enum: ["beginner", "intermediate", "advanced"],
  }).notNull(),
  isFree: integer("is_free", { mode: "boolean" }).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const courseLogs = sqliteTable("course_logs", {
  id: text("id")
    .$defaultFn(() => createId())
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
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

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
  discount: many(discount),
  quiz: many(quiz),
  quizResponse: many(quizResponse),
  logs: many(courseLogs),
}));

export type Course = typeof course.$inferSelect;
export type NewCourse = typeof course.$inferInsert;
