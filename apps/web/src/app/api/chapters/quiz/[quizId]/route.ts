import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  quiz
} from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ courseId: string; quizId: string }> }
) {
  const params = await props.params;
  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: params.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const quizExists = await db.query.quiz.findFirst({
      where: and(
        eq(quiz.id, params.quizId),
        eq(quiz.courseId, params.courseId)
      ),
      columns: { id: true },
    });

    if (!quizExists) {
      return Response.json({
        error: {
          code: "invalid_quiz_id",
          message: "Please enter a valid quizId",
        },
      });
    }

    await db.delete(quiz).where(eq(quiz.id, quizExists.id));

    return Response.json({ success: true });
  } catch (error) {
    console.log(
      "Error while deleting quiz",
      params.courseId,
      params.quizId,
      error
    );

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
