import { db } from "@/db";
import { courseEnrollment, session } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const courseId = params.get("courseId");

    if (!courseId) {
      return Response.json(
        {
          error: {
            code: "missing_course_id",
            message: "Please provide a valid course id",
          },
        },
        { status: 400 }
      );
    }

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
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, sessionExists.user.id)
      ),
    });

    if (userHasEnrolled) {
      return Response.json(
        {
          data: {
            success: true,
            message: "User is enrolled ",
          },
        },
        { status: 200 }
      );
    }

    return Response.json({ data: { success: false } }, { status: 400 });
  } catch (error) {
    console.log("error while enrolling into course", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
