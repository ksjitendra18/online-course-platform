import { db } from "@/db";
import { chapter, course } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import redis from "@/lib/redis";
import { BasicInfoSchema } from "@/validations/basic-info";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

const PartialBasicInfoSchema = BasicInfoSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const reqBody = await request.json();

    const parsedData = PartialBasicInfoSchema.safeParse(reqBody);

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

    // if course was previously free and is now paid
    // make every chapter paid
    if (courseInfo.isFree && !parsedData.data.isFree) {
      await db
        .update(chapter)
        .set({
          isFree: false,
        })
        .where(eq(chapter.courseId, courseInfo.id));
    }

    // if course was previously paid and is now free
    // make every chapter free
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
      .set(parsedData.data)
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

    const courseData = await db.query.course.findFirst({
      where: eq(course.id, params.courseId),
      columns: {
        id: true,
      },
      with: {
        videos: {
          columns: {
            playbackId: true,
          },
        },
      },
    });

    if (!courseData) {
      return Response.json(
        {
          error: {
            code: "course_not_found",
            message: "Course not found",
          },
        },
        { status: 404 }
      );
    }

    const videoIds = courseData.videos.map((video) => video.playbackId);

    await redis.sadd("delete_videos", ...videoIds);
    await db.delete(course).where(eq(course.id, params.courseId));
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while deleting module", params.courseId, error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
