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
import { logs } from "./logs";

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
      .$defaultFn(() => createId())
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
    chapterCourseIdx: index("cl_course_idx").on(table.courseId),
  })
);

export const chapterLogsRelations = relations(chapterLogs, ({ one, many }) => ({
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
