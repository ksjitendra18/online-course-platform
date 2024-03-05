import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { courseModule } from "./course-modules";

export const attachment = sqliteTable(
  "attachment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    url: text("url").notNull(),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
    moduleId: text("module_id").references(() => courseModule.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      courseIdIdx: index("attachment_course_id_idx").on(table.courseId),
    };
  }
);
