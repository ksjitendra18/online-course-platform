import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { courseEnrollment } from "@/db/schema";
import { checkAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
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

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, userInfo.id)
      ),
    });

    if (isEnrolled) {
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
