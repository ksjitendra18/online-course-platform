import { db } from "@/db";
import { courseEnrollment, session } from "@/db/schema";
import { courseProgress } from "@/db/schema/course-progress";
import { checkAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chapterId, isCompleted, courseId } = await request.json();

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const userHasEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, userInfo.id)
      ),
    });

    if (!userHasEnrolled) {
      return Response.json(
        {
          error: {
            code: "user_not_enrolled",
            message: "Enroll into course first",
          },
        },
        { status: 400 }
      );
    }

    const progressExists = await db.query.courseProgress.findFirst({
      where: and(
        eq(courseProgress.chapterId, chapterId),
        eq(courseProgress.userId, userInfo.id)
      ),
    });

    if (progressExists) {
      return Response.json({ success: true });
    }
    await db.insert(courseProgress).values({
      chapterId,
      isCompleted,
      courseId,
      userId: userInfo.id,
    });
    return Response.json({ success: true });
  } catch (error) {
    console.log("error while updating progress", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
