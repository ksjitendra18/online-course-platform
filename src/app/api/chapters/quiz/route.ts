import { db } from "@/db";
import { chapter } from "@/db/schema";
import { quiz, quizAnswer, quizQuestion } from "@/db/schema/quiz";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { QuizSchema } from "@/validations/quiz-question";

import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { moduleId, courseId, chapterSlug, question, options } =
      await request.json();

    const parsedData = QuizSchema.safeParse({
      moduleId,
      courseId,
      chapterSlug,
      question,
      options,
    });

    if (!parsedData.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedData.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const chapterExists = await db
      .select({ id: chapter.id })
      .from(chapter)
      .where(
        and(
          eq(chapter.moduleId, parsedData.data.moduleId),
          eq(chapter.slug, parsedData.data.chapterSlug)
        )
      );

    const chapterId = chapterExists[0].id;

    let quizId: string | null;

    const quizExists = await db
      .select({ id: quiz.id })
      .from(quiz)
      .where(and(eq(quiz.chapterId, chapterId), eq(quiz.courseId, courseId)));

    if (quizExists.length > 0) {
      quizId = quizExists[0].id;
    } else {
      const newQuiz = await db
        .insert(quiz)
        .values({
          chapterId,
          duration: 30,
          courseId,
          status: "draft",
          instructions: "Please answer all the question correctly",
        })
        .returning({ id: quiz.id });

      quizId = newQuiz[0].id;
    }

    const newQuestion = await db
      .insert(quizQuestion)
      .values({
        questionText: question,
        quizId,
      })
      .returning({ id: quizQuestion.id });

    for (const option of parsedData.data.options) {
      await db.insert(quizAnswer).values({
        answerText: option.option,
        isCorrect: option.isCorrect,
        questionId: newQuestion[0].id,
      });
    }

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while quiz", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
