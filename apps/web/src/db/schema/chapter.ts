import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { article } from "./article";
import { attachment } from "./attachment";
import { user } from "./auth";
import { course } from "./course";
import { courseModule } from "./course-modules";
import { courseProgress } from "./course-progress";
import { quiz } from "./quiz";
import { videoData } from "./video-data";

export const chapter = sqliteTable(
  "chapter",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    position: integer("position").notNull(),
    modulePosition: integer("module_position").notNull(),
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

export const chapterLogs = sqliteTable(
  "chapter_logs",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),
    action: text("action", {
      enum: [
        "create",
        "update",
        "delete",
        "upload_video",
        "create_quiz",
        "publish",
        "unpublish",
      ],
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
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    chapterLogsCourseIdx: index("cl_course_idx").on(table.courseId),
    chapterLogsChapterIdx: index("cl_chapter_idx").on(table.chapterId),
  })
);

export const chapterLogsRelations = relations(chapterLogs, ({ one }) => ({
  chapter: one(chapter, {
    fields: [chapterLogs.chapterId],
    references: [chapter.id],
  }),
  course: one(course, {
    fields: [chapterLogs.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [chapterLogs.userId],
    references: [user.id],
  }),
}));
