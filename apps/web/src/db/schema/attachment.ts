import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulidx";

import { chapter } from "./chapter";
import { videoData } from "./video-data";

export const attachment = sqliteTable(
  "attachment",
  {
    id: text("id")
      .$defaultFn(() => ulid())
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
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    attachChapIdIdx: index("attach_chap_id_idx").on(table.chapterId),
  })
);

export const attachmentRelations = relations(attachment, ({ one }) => ({
  chapter: one(chapter, {
    fields: [attachment.chapterId],
    references: [chapter.id],
  }),
}));

export const videoAttachment = sqliteTable(
  "video_attachment",
  {
    id: text("id")
      .$defaultFn(() => ulid())
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
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    vidAttVidIdIdx: index("vidattc_vid_id_idx").on(table.videoId),
  })
);

export const videoAttachmentRelations = relations(
  videoAttachment,
  ({ one }) => ({
    videoData: one(videoData, {
      fields: [videoAttachment.videoId],
      references: [videoData.id],
    }),
  })
);
