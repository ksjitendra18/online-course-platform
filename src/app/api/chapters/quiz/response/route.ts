import { db } from "@/db";
import {
  chapter,
  courseProgress,
  quiz,
  quizResponse,
  quizUserResponse,
  session,
} from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { QuizResponsesSchema } from "@/validations/quiz-response";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { responses, moduleId, courseId, chapterSlug, chapterId } =
      await request.json();

    const parsedData = QuizResponsesSchema.safeParse({
      moduleId,
      courseId,
      chapterSlug,
      chapterId,
      responses,
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

    const chapterExists = await db.query.chapter.findFirst({
      where: and(
        eq(chapter.moduleId, parsedData.data.moduleId),
        eq(chapter.slug, parsedData.data.chapterSlug)
      ),
      columns: { id: true },
    });

    if (!chapterExists) {
      return Response.json(
        {
          error: {
            code: "chapter_not_exists",
            message: "Chapter doesn't exist. Please provide a valid Chapter ID",
          },
        },
        { status: 404 }
      );
    }

    const quizExists = await db.query.quiz.findFirst({
      where: and(
        eq(quiz.chapterId, chapterExists.id),
        eq(quiz.courseId, courseId)
      ),
      columns: { id: true },
    });

    if (!quizExists) {
      return Response.json(
        { error: { code: "quiz_not_exists" } },
        { status: 400 }
      );
    }

    const newQuizResponse = await db
      .insert(quizResponse)
      .values({
        userId: userInfo.id,
        quizId: quizExists.id,
        courseId: parsedData.data.courseId,
        duration: 0,
      })
      .returning({ id: quizResponse.id });

    for (const response of parsedData.data.responses) {
      await db.insert(quizUserResponse).values({
        quizResponseId: newQuizResponse[0].id,
        questionId: response.questionId,
        answerId: response.answerId,
      });
    }

    await db.insert(courseProgress).values({
      isCompleted: true,
      chapterId: parsedData.data.chapterId,
      courseId: parsedData.data.courseId,
      userId: userInfo.id,
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while submitting quiz", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Please try again" },
      },
      { status: 500 }
    );
  }
}
