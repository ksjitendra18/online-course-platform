import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { course } from "./course";

export const courseMember = sqliteTable(
  "course_member",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    role: text("role", {
      enum: ["owner", "admin", "auditor", "teacher"],
    }).notNull(),

    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.courseId, table.userId] }),
    };
  }
);

export const courseMemberRelations = relations(courseMember, ({ one }) => ({
  user: one(user, {
    fields: [courseMember.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [courseMember.courseId],
    references: [course.id],
  }),
}));
