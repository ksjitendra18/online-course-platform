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
import { user } from "./auth";

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
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    position: integer("position").notNull(),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
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

export const courseModuleLogs = sqliteTable("course_module_logs", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  action: text("action", {
    enum: ["create", "update", "delete"],
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
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

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
