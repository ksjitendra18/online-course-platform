import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { courseModule } from "./course-modules";
import { videoData } from "./video-data";
import { article } from "./article";
import { quiz } from "./quiz";
import { attachment } from "./attachment";
import { course } from "./course";
import { courseProgress } from "./course-progress";
import { user } from "./auth";

export const chapter = sqliteTable(
  "chapter",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    position: integer("position").notNull(),
    modulePosition: integer("module_position").notNull(),
    isPublished: integer("is_published", { mode: "boolean" })
      .default(false)
      .notNull(),
    isFree: integer("is_free", { mode: "boolean" }).default(false).notNull(),
    moduleId: text("module_id")
      .notNull()
      .references(() => courseModule.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    type: text("type", {
      enum: ["quiz", "video", "attachment", "article"],
    }).notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => {
    return {
      moduleId_Slug: uniqueIndex("module_id_slug").on(
        table.moduleId,
        table.slug
      ),
      chapter_course_idx: index("chapter_course_idx").on(table.courseId),
    };
  }
);

export const chapterLogs = sqliteTable("chapter_logs", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  action: text("action", {
    enum: ["create", "update", "delete", "upload_video", "create_quiz"],
  }),
  description: text("description"),
  chapterId: text("chapter_id").references(() => chapter.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
    onUpdate: "set null",
  }),
  createdAt: text("created_at"),
});

export const chapterRelations = relations(chapter, ({ one, many }) => ({
  courseModule: one(courseModule, {
    fields: [chapter.moduleId],
    references: [courseModule.id],
  }),
  course: one(course, {
    fields: [chapter.courseId],
    references: [course.id],
  }),
  videoData: many(videoData),
  article: many(article),
  quiz: many(quiz),
  attachment: many(attachment),
  progress: many(courseProgress),
  logs: many(chapterLogs),
}));
