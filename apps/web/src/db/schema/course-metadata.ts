import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { course } from "./course";

export const courseMetaData = sqliteTable(
  "course_metadata",
  {
    id: text()
      .$defaultFn(() => ulid())
      .primaryKey(),
    courseId: text()
      .references(() => course.id, {})
      .notNull(),
    modulesCount: integer().notNull(),
    quizzesCount: integer().notNull(),
    videosCount: integer().notNull(),
    videoDuration: integer().notNull(),
    attachmentCount: integer().notNull(),
  },
  (table) => ({
    courseMetaDataCourseIdIdx: index("course_metdata_course_id_idx").on(
      table.courseId
    ),
  })
);

export const courseMetaDataRelations = relations(courseMetaData, ({ one }) => ({
  course: one(course, {
    fields: [courseMetaData.courseId],
    references: [course.id],
  }),
}));
