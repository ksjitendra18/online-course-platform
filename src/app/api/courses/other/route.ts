import { db } from "@/db/index";
import { and, eq } from "drizzle-orm";
import { course, courseCategory, courseMember, session } from "@/db/schema";
import { cookies } from "next/headers";
import { OtherInfoSchema } from "@/validations/other-info";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      courseId,
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategoryId,
      courseValidity,
      courseImg,
    } = await request.json();

    const parsedResult = OtherInfoSchema.safeParse({
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategoryId,
      courseImg,
    });

    if (!parsedResult.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedResult.error.format(),
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

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    await db.batch([
      db
        .update(course)
        .set({
          imageUrl: parsedResult.data.courseImg,
          validity: courseValidity,
          price: parsedResult.data.coursePrice,
          isPublished: true,
        })
        .where(eq(course.id, courseId)),

      db.insert(courseCategory).values({
        courseId,
        categoryId: courseCategoryId,
      }),
    ]);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("error while updating other course details", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Please try again" },
      },
      { status: 500 }
    );
  }
}
