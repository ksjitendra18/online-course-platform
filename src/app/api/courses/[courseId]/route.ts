import { db } from "@/db";
import { chapter, course, courseMember, session } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { BasicInfoSchema } from "@/validations/basic-info";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseName, courseSlug, courseDescription, level, isFree } =
      await request.json();

    const parsedData = BasicInfoSchema.safeParse({
      courseName,
      courseSlug,
      courseDescription,
      level,
      isFree,
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

    const courseInfo = await db.query.course.findFirst({
      where: eq(course.id, params.courseId),
      columns: {
        id: true,
        isFree: true,
      },
    });

    if (!isAuthorized || !courseInfo) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    // if course is already free
    // make every chapter paid
    if (courseInfo.isFree && !parsedData.data.isFree) {
      await db
        .update(chapter)
        .set({
          isFree: false,
        })
        .where(eq(chapter.courseId, courseInfo.id));
    }

    if (!courseInfo.isFree && parsedData.data.isFree) {
      await db
        .update(chapter)
        .set({
          isFree: true,
        })
        .where(eq(chapter.courseId, courseInfo.id));
    }

    await db
      .update(course)
      .set({
        title: parsedData.data.courseName,
        slug: parsedData.data.courseSlug,
        description: parsedData.data.courseDescription,
        isFree: parsedData.data.isFree,
        level: parsedData.data.level,
      })
      .where(eq(course.id, courseInfo.id));

    revalidatePath("/dashboard/courses");
    revalidatePath("/courses");
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updating course", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
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
    //! FIX ME: DELETE VIDEOS
    await db.delete(course).where(eq(course.id, params.courseId));
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while deleting module", params.courseId, error);
    return Response.json({
      error: { code: "server_error", message: "Internal server Error" },
    });
  }
}
