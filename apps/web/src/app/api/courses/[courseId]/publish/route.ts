import { eq } from "drizzle-orm";

import { clearCourseData } from "@/actions/clear-course-data";
import { db } from "@/db";
import { course } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";

export async function POST(request: Request, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const courseId = params.courseId;

  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: courseId,
      userId: userInfo.id,
    });

    const courseInfo = await db.query.course.findFirst({
      where: eq(course.id, courseId),
      columns: {
        id: true,
        slug: true,
        isFree: true,
        status: true,
      },
    });

    if (!isAuthorized || !courseInfo) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    if (courseInfo.status === "published") {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: "Course is already published",
          },
        },
        { status: 400 }
      );
    }

    await db
      .update(course)
      .set({ status: "published" })
      .where(eq(course.id, courseId));

    await clearCourseData(courseInfo.slug);

    return Response.json({
      data: {
        status: "published",
      },
    });
  } catch (error) {
    console.error("Error while publishing course:", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
