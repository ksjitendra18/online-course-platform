import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";

export const orderData = sqliteTable(
  "order_data",
  {
    id: text("id").$defaultFn(() => createId()),
    courseId: text("course_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      userIdKey: uniqueIndex("order_user_id_idx").on(table.userId),
      courseIdUserIdKey: uniqueIndex("order_user_course_id_idx").on(
        table.courseId,
        table.userId
      ),
    };
  }
);
