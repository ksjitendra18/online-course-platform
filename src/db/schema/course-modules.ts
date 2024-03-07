import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { chapter } from "./chapter";

export const courseModule = sqliteTable(
  "module",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("module_slug").notNull(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    position: integer("position").notNull(),
  },
  (table) => {
    return {
      courseModuleSlug: uniqueIndex("course_module_slug").on(
        table.courseId,
        table.slug
      ),
    };
  }
);

export const courseModuleToCourse = relations(
  courseModule,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseModule.courseId],
      references: [course.id],
    }),
    chapter: many(chapter),
  })
);
