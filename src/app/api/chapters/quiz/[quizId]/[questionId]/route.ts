import { db } from "@/db";
import {
  chapter,
  courseMember,
  courseModule,
  quiz,
  quizAnswer,
  quizQuestion,
  session,
} from "@/db/schema";
import { QuizEditSchema } from "@/validations/quiz-question";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { quizId: string; questionId: string } }
) {
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

    // check authentication
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, token),
      columns: { id: true },
      with: {
        user: {
          columns: { id: true },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    // check authorization

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

    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.courseId, quizExists.courseId),
        eq(courseMember.userId, sessionExists.user.id)
      ),
    });

    if (!courseMemberInfo) {
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
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string; questionId: string } }
) {
  try {
    // check authentication
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, token),
      columns: { id: true },
      with: {
        user: {
          columns: { id: true },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    // check authorization

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

    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.courseId, quizExists.courseId),
        eq(courseMember.userId, sessionExists.user.id)
      ),
    });

    if (!courseMemberInfo) {
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
