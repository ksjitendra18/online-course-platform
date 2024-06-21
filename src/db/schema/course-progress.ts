import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { category } from "./category";
import { course } from "./course";
import { createId } from "@paralleldrive/cuid2";
import { chapter } from "./chapter";

export const courseProgress = sqliteTable(
  "course_progress",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
    isCompleted: integer("is_completed", { mode: "boolean" }).notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("course_progress_user_id_idx").on(table.userId),
    userChapIdIdx: uniqueIndex("course_progress_user_id_idx").on(
      table.userId,
      table.chapterId
    ),
  })
);

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  user: one(user, {
    fields: [courseProgress.userId],
    references: [user.id],
  }),
  chapter: one(chapter, {
    fields: [courseProgress.chapterId],
    references: [chapter.id],
  }),
  course: one(course, {
    fields: [courseProgress.courseId],
    references: [course.id],
  }),
}));
