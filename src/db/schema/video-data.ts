import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { chapter } from "./chapter";

export const videoData = sqliteTable(
  "video_data",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    assetId: text("asset_id").notNull(),
    playbackId: text("playback_id"),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      chapterIdKey: uniqueIndex("video_chapter_id_idx").on(table.chapterId),
    };
  }
);
