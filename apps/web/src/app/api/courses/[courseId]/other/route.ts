import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course, courseCategory } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { OtherInfoSchema } from "@/validations/other-info";

export async function PATCH(request: NextRequest, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  try {
    const {
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategories,
      courseValidity,
      courseImg,
    } = await request.json();

    const parsedData = OtherInfoSchema.safeParse({
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategories,
      courseImg,
      courseValidity,
    });

    console.log("parsedData", courseValidity, parsedData, courseValidity);

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

    const categoryData = parsedData.data.courseCategories.map((categoryId) => ({
      courseId: params.courseId,
      categoryId,
    }));

    // before inserting categories delete all categories of the course
    await db.transaction(async (trx) => {
      await trx
        .delete(courseCategory)
        .where(eq(courseCategory.courseId, params.courseId));

      await trx.insert(courseCategory).values(categoryData);
    });

    await db
      .update(course)
      .set({
        imageUrl: parsedData.data.courseImg,
        validity: courseValidity,
        price: parsedData.data.coursePrice,
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
