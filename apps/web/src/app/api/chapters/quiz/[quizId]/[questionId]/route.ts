import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { quiz, quizAnswer, quizQuestion } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { QuizEditSchema } from "@/validations/quiz-question";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ quizId: string; questionId: string }> }
) {
  const params = await props.params;
  try {
    const { question, options } = await request.json();

    const parsedData = QuizEditSchema.safeParse({
      quizId: params.quizId,
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

    const quizExists = await db.query.quiz.findFirst({
      where: eq(quiz.id, params.quizId),
      columns: { id: true, courseId: true },
    });

    if (!quizExists) {
      return Response.json(
        {
          error: {
            code: "invalid_chapter_id",
            message: "Please enter a valid chapterId",
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
      courseId: quizExists.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const questionExists = await db.query.quizQuestion.findFirst({
      where: eq(quizQuestion.id, params.questionId),
      columns: {
        id: true,
      },
    });

    if (!questionExists) {
      return Response.json({
        error: {
          code: "invalid_question_id",
          message: "Please enter a valid questionId",
        },
      });
    }

    // !INEFFICIENT
    // delete all answers and repopulate
    await db
      .delete(quizAnswer)
      .where(eq(quizAnswer.questionId, questionExists.id));

    // update quizquestion
    await db
      .update(quizQuestion)
      .set({
        questionText: parsedData.data.question,
      })
      .where(eq(quizQuestion.id, questionExists.id));

    for (const option of parsedData.data.options) {
      await db.insert(quizAnswer).values({
        answerText: option.option,
        isCorrect: option.isCorrect,
        questionId: questionExists.id,
      });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while deleting quiz", params.quizId, error);
    return Response.json(
      {
        error: {
          code: "server_error",
          message: "Server Error",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ quizId: string; questionId: string }> }
) {
  const params = await props.params;
  try {
    const quizExists = await db.query.quiz.findFirst({
      where: eq(quiz.id, params.quizId),
      columns: { id: true, courseId: true },
    });

    if (!quizExists) {
      return Response.json(
        {
          error: {
            code: "invalid_chapter_id",
            message: "Please enter a valid chapterId",
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
      courseId: quizExists.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const questionExists = await db.query.quizQuestion.findFirst({
      where: eq(quizQuestion.id, params.questionId),
      columns: {
        id: true,
      },
    });

    if (!questionExists) {
      return Response.json({
        error: {
          code: "invalid_question_id",
          message: "Please enter a valid questionId",
        },
      });
    }

    await db.delete(quizQuestion).where(eq(quizQuestion.id, params.questionId));
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while deleting quiz", params.quizId, error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
