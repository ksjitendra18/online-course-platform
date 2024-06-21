import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { chapter } from "./chapter";

export const article = sqliteTable(
  "article",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    content: text("string").notNull(),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    articleChapIdIdx: index("chap_id_idx").on(table.chapterId),
  })
);

export const articleRelations = relations(article, ({ one }) => ({
  chapter: one(chapter, {
    fields: [article.chapterId],
    references: [chapter.id],
  }),
}));
