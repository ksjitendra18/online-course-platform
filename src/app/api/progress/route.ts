import { db } from "@/db";
import { courseEnrollment, session } from "@/db/schema";
import { courseProgress } from "@/db/schema/course-progress";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chapterId, isCompleted, courseId } = await request.json();

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
          with: {
            organizationMember: true,
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

    // check enrollment status

    const userHasEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, sessionExists.user.id)
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
        eq(courseProgress.userId, sessionExists.user.id)
      ),
    });

    if (progressExists) {
      return Response.json({ success: true });
    }
    await db.insert(courseProgress).values({
      chapterId,
      isCompleted,
      courseId,
      userId: sessionExists.user.id,
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
