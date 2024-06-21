import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { course } from "./course";
import { user } from "./auth";

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
    role: text("role", { enum: ["owner", "admin", "teacher"] }).notNull(),
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
