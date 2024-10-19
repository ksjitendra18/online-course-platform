import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { course } from "./course";

export const discussion = sqliteTable(
  "discussion",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    question: text("text").notNull(),
    description: text("description"),
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
    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    disc_course_id_idx: index("disc_course_id_idx").on(table.courseId),
  })
);

export const discussionRelations = relations(discussion, ({ one, many }) => ({
  user: one(user, {
    fields: [discussion.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [discussion.courseId],
    references: [course.id],
  }),
  answers: many(discussionReply),
  votes: many(discussionVote),
}));

export const discussionReply = sqliteTable(
  "discussion_reply",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    reply: text("reply"),
    discussionId: text("discussion_id")
      .notNull()
      .references(() => discussion.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
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
    dreplyDiscIdIdx: index("dreply_disc_id_idx").on(table.discussionId),
  })
);

export const discussionReplyRelations = relations(
  discussionReply,
  ({ one, many }) => ({
    user: one(user, {
      fields: [discussionReply.userId],
      references: [user.id],
    }),
    discussion: one(discussion, {
      fields: [discussionReply.discussionId],
      references: [discussion.id],
    }),

    votes: many(discussionVote),
  })
);

export const discussionVote = sqliteTable(
  "discussion_vote",
  {
    discussionId: text("discussion_id")
      .notNull()
      .references(() => discussion.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    upvotes: integer("upvote").default(0).notNull(),
    downvote: integer("downvote").default(0).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.discussionId, table.userId] }),
      dvDiscIdIdx: index("dv_disc_id_idx").on(table.discussionId),
    };
  }
);

export const discussionVoteRelations = relations(discussionVote, ({ one }) => ({
  user: one(user, {
    fields: [discussionVote.userId],
    references: [user.id],
  }),
  discussion: one(discussion, {
    fields: [discussionVote.discussionId],
    references: [discussion.id],
  }),
  discussionReply: one(discussionReply, {
    fields: [discussionVote.discussionId],
    references: [discussionReply.id],
  }),
}));
