import { db } from "@/db";
import {
  course,
  courseCategory,
  courseMember,
  courseModule,
  session,
} from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { ModuleInfoSchema } from "@/validations/module-info";
import { OtherInfoSchema } from "@/validations/other-info";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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

    const parsedData = OtherInfoSchema.safeParse({
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategoryId,
      courseImg,
    });

    if (!parsedData.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedData.error.format(),
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
      courseId: params.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    // !MULTI CATEGORY NEED FIX

    await db
      .delete(courseCategory)
      .where(eq(courseCategory.courseId, params.courseId));

    await db.insert(courseCategory).values({
      courseId,
      categoryId: parsedData.data.courseCategoryId,
    });

    await db
      .update(course)
      .set({
        imageUrl: parsedData.data.courseImg,
        validity: courseValidity,
        price: parsedData.data.coursePrice,
        isPublished: true,
      })
      .where(eq(course.id, params.courseId));

    revalidateTag("get-course-info");
    return Response.json({ success: true });
  } catch (error) {
    console.log(
      "Error while updating other course details",
      params.courseId,
      error
    );

    return Response.json(
      {
        error: {
          code: "server_error",
          message: "Internal Server Error.Please try again",
        },
      },
      { status: 500 }
    );
  }
}
