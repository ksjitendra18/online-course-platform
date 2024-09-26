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
import { chapter } from "./chapter";
import { course } from "./course";

export const courseModule = sqliteTable(
  "course_module",
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
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    position: integer("position").notNull(),
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
  (table) => ({
    courseModuleSlug: uniqueIndex("course_module_slug").on(
      table.courseId,
      table.slug
    ),
  })
);

export const courseModuleLogs = sqliteTable(
  "course_module_logs",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    action: text("action", {
      enum: ["create", "update", "delete", "publish", "unpublish"],
    }),

    description: text("description"),
    moduleId: text("module_id").references(() => courseModule.id, {
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
    courseModuleLogsCourseIdx: index("course_module_course_idx").on(
      table.courseId
    ),
    courseModuleLogsUserIdx: index("course_module_logs_user_idx").on(
      table.userId
    ),
  })
);

export const courseModuleRelations = relations(
  courseModule,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseModule.courseId],
      references: [course.id],
    }),
    chapter: many(chapter),
    logs: many(courseModuleLogs),
  })
);

export const courseModuleLogsRelations = relations(
  courseModuleLogs,
  ({ one, many }) => ({
    module: one(courseModule, {
      fields: [courseModuleLogs.moduleId],
      references: [courseModule.id],
    }),
    course: one(course, {
      fields: [courseModuleLogs.courseId],
      references: [course.id],
    }),
    user: one(user, {
      fields: [courseModuleLogs.userId],
      references: [user.id],
    }),
  })
);
