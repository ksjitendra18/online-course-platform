import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { chapter } from "./chapter";
import { videoData } from "./video-data";
import { index } from "drizzle-orm/sqlite-core";

export const attachment = sqliteTable(
  "attachment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    size: integer("size"),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    attachChapIdIdx: index("attach_chap_id_idx").on(table.chapterId),
  })
);

export const videoAttachment = sqliteTable(
  "video_attachment",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    name: text("name").notNull(),
    url: text("url").notNull(),
    size: integer("size"),
    videoId: text("video_id")
      .notNull()
      .references(() => videoData.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at").$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    vidAttVidIdIdx: index("vidattc_vid_id_idx").on(table.videoId),
  })
);

export const attachmentRelations = relations(attachment, ({ one }) => ({
  chapter: one(chapter, {
    fields: [attachment.chapterId],
    references: [chapter.id],
  }),
}));

export const videoAttachmentRelations = relations(
  videoAttachment,
  ({ one }) => ({
    videoData: one(videoData, {
      fields: [videoAttachment.videoId],
      references: [videoData.id],
    }),
  })
);
