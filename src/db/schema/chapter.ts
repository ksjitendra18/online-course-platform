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

export const chapter = sqliteTable(
  "chapter",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    videoUrl: text("video_url"),
    position: integer("position").notNull(),
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
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at"),
  },
  (table) => {
    return {
      moduleIdIdx: index("chapter_module_id_idx").on(table.moduleId),
      moduleId_Slug: uniqueIndex("module_id_slug").on(
        table.moduleId,
        table.slug
      ),
    };
  }
);

export const chapterToModule = relations(chapter, ({ one }) => ({
  courseModule: one(courseModule, {
    fields: [chapter.moduleId],
    references: [courseModule.id],
  }),
}));
