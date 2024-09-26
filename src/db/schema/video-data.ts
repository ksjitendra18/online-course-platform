import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { videoAttachment } from "./attachment";
import { chapter } from "./chapter";
import { course } from "./course";

export const videoData = sqliteTable(
  "video_data",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    playbackId: text("playback_id").notNull(),
    duration: integer("duration").notNull(),
    courseId: text("course_id").references(() => course.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .unique(),
    isFlagged: integer("is_flagged", { mode: "boolean" }).default(false),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => {
    return {
      vdCourseIdIdx: index("video_course_id_idx").on(table.courseId),
      vdChapterIdIdx: index("video_chapter_id_idx").on(table.chapterId),
      vdCourseChapIdx: uniqueIndex("video_course_chap_idx").on(
        table.courseId,
        table.chapterId
      ),
    };
  }
);

export const videoRelations = relations(videoData, ({ many, one }) => ({
  chapter: one(chapter, {
    fields: [videoData.chapterId],
    references: [chapter.id],
  }),
  course: one(course, {
    fields: [videoData.courseId],
    references: [course.id],
  }),
  attachments: many(videoAttachment),
}));
