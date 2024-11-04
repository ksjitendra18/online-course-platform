import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { chapter } from "./chapter";

export const article = sqliteTable(
  "article",
  {
    id: text("id")
      .$defaultFn(() => ulid())
      .primaryKey(),

    content: text("string").notNull(),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
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
