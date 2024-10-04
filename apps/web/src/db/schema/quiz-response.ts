import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { course } from "./course";
import { quiz, quizAnswer, quizQuestion } from "./quiz";

export const quizResponse = sqliteTable(
  "quiz_response",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    duration: integer("duration").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    createdAt: integer("created_at")
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (table) => ({
    courseIdIdx: index("quiz_course_idx").on(table.courseId),
    userQuizIdIdx: uniqueIndex("quiz_user_id_idx").on(
      table.quizId,
      table.userId
    ),
  })
);

export const quizUserResponse = sqliteTable(
  "quiz_user_response",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    quizResponseId: text("quiz_response_id")
      .notNull()
      .references(() => quizResponse.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    questionId: text("question_id")
      .notNull()
      .references(() => quizQuestion.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    answerId: text("answer_id")
      .notNull()
      .references(() => quizAnswer.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => ({
    questionQuizIdIdx: uniqueIndex("quizres_ques_id_idx").on(
      table.quizResponseId,
      table.questionId
    ),
  })
);

export const quizUserResponseRelations = relations(
  quizUserResponse,
  ({ one }) => ({
    quizResponse: one(quizResponse, {
      fields: [quizUserResponse.quizResponseId],
      references: [quizResponse.id],
    }),
    question: one(quizQuestion, {
      fields: [quizUserResponse.questionId],
      references: [quizQuestion.id],
    }),
    answer: one(quizAnswer, {
      fields: [quizUserResponse.answerId],
      references: [quizAnswer.id],
    }),
  })
);
export const quizResponseRelations = relations(
  quizResponse,
  ({ one, many }) => ({
    quiz: one(quiz, {
      fields: [quizResponse.quizId],
      references: [quiz.id],
    }),
    course: one(course, {
      fields: [quizResponse.courseId],
      references: [course.id],
    }),
    quizUserResponse: many(quizUserResponse),

    user: one(user, {
      fields: [quizResponse.userId],
      references: [user.id],
    }),
  })
);
