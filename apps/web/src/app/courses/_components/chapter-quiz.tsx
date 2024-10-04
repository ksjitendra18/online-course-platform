import { redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { quiz, quizResponse } from "@/db/schema";

import ChapterQuizQuestion from "./chapter-quiz-question";
import ChapterQuizResponseNew from "./chapter-quiz-response-new";

const ChapterQuiz = async ({
  chapterId,
  chapterSlug,
  courseId,
  moduleId,
}: {
  courseId: string;
  moduleId: string;
  chapterId: string;
  chapterSlug: string;
}) => {
  const userInfo = await getUserSessionRedis();
  if (!userInfo) {
    return redirect("/login");
  }

  const quizInfo = await db.query.quiz.findFirst({
    where: eq(quiz.chapterId, chapterId),
    with: {
      questions: {
        with: {
          answers: {},
        },
      },
    },
  });

  if (!quizInfo) {
    return redirect("/");
  }

  const userResponse = await db.query.quizResponse.findFirst({
    where: and(
      eq(quizResponse.userId, userInfo.userId),
      eq(quizResponse.quizId, quizInfo.id)
    ),
    with: {
      quizUserResponse: {
        with: {
          question: {
            with: { answers: true },
          },
          answer: true,
        },
      },
    },
  });

  const chapterQuizResponse = await db.query.quiz.findFirst({
    where: eq(quiz.id, quizInfo.id),
    columns: {},
    with: {
      questions: {
        with: { answers: true },
      },
      response: {
        where: eq(quizResponse.userId, userInfo.userId),
        with: {
          quizUserResponse: true,
        },
      },
    },
  });

  return (
    <>
      {userResponse ? (
        <>
          {/* <ChapterQuizResponse userResponse={userResponse} /> */}
          <ChapterQuizResponseNew chapterQuizResponse={chapterQuizResponse} />
        </>
      ) : (
        <ChapterQuizQuestion
          chapterSlug={chapterSlug}
          courseId={courseId}
          moduleId={moduleId}
          chapterId={chapterId}
          chapterQuiz={quizInfo}
        />
      )}
    </>
  );
};

export default ChapterQuiz;
