import { db } from "@/db";
import { courseEnrollment, session } from "@/db/schema";
import { courseProgress } from "@/db/schema/course-progress";
import { checkAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const userHasEnrolled = await db.query.courseEnrollment.findFirst({
      columns: { id: true },
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, userInfo.id)
      ),
    });

    if (userHasEnrolled) {
      return Response.json(
        {
          error: {
            code: "user_already_enrolled",
            message: "User is already enrolled ",
          },
        },
        { status: 400 }
      );
    }
    await db.insert(courseEnrollment).values({
      courseId,
      userId: userInfo.id,
    });

    revalidateTag("get-enrolled-course");
    revalidateTag("get-total-enrollments");
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while enrolling into course", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
