import { db } from "@/db";
import {
  chapter,
  courseMember,
  courseModule,
  quiz,
  quizQuestion,
  session,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; quizId: string } }
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
          with: {
            organizationMember: {
              columns: { id: true },
            },
          },
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

    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.courseId, params.courseId),
        eq(courseMember.userId, sessionExists.user.id)
      ),
      with: {
        course: {
          columns: { id: true },
        },
      },
    });

    if (!courseMemberInfo) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const quizExists = await db.query.quiz.findFirst({
      where: and(
        eq(quiz.id, params.quizId),
        eq(quiz.courseId, courseMemberInfo.course.id)
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
