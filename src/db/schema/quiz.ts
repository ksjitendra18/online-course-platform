import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { chapter } from "./chapter";
import { course } from "./course";
import { quizResponse, quizUserResponse } from "./quiz-response";

export const quiz = sqliteTable(
  "quiz",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, {
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

    isPublished: integer("is_published", { mode: "boolean" }).default(false),
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    qzChapId: index("quiz_chap_idx").on(table.chapterId),
    qzCourseChapId: uniqueIndex("quiz_course_chap_idx").on(
      table.courseId,
      table.chapterId
    ),
  })
);

export const quizQuestion = sqliteTable(
  "quiz_question",
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

    questionText: text("question_text").notNull(),
    type: text("type", {
      enum: ["single_select", "multi_select", "true_false"],
    }),
  },
  (table) => ({
    qzQuesQId: index("qzques_qid_idx").on(table.quizId),
  })
);

export const quizAnswer = sqliteTable(
  "quiz_answer",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),

    questionId: text("question_id")
      .notNull()
      .references(() => quizQuestion.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    answerText: text("answer_text").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  },
  (table) => ({
    qzAnsQuesId: index("qzans_quesid_idx").on(table.questionId),
  })
);

export const quizAnswerRelations = relations(quizAnswer, ({ one, many }) => ({
  question: one(quizQuestion, {
    fields: [quizAnswer.questionId],
    references: [quizQuestion.id],
  }),
  response: many(quizUserResponse),
}));

export const quizQuestionRelations = relations(
  quizQuestion,
  ({ one, many }) => ({
    quiz: one(quiz, {
      fields: [quizQuestion.quizId],
      references: [quiz.id],
    }),
    answers: many(quizAnswer),
    response: many(quizUserResponse),
  })
);

export const quizRelations = relations(quiz, ({ one, many }) => ({
  chapter: one(chapter, {
    fields: [quiz.chapterId],
    references: [chapter.id],
  }),
  course: one(course, {
    fields: [quiz.chapterId],
    references: [course.id],
  }),
  questions: many(quizQuestion),
  response: many(quizResponse),
}));
