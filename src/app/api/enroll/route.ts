import { db } from "@/db";
import { courseEnrollment, session } from "@/db/schema";
import { courseProgress } from "@/db/schema/course-progress";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

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

    // check enrollment status

    const userHasEnrolled = await db.query.courseEnrollment.findFirst({
      columns: { id: true },
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, sessionExists.user.id)
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
      userId: sessionExists.user.id,
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
