import { db } from "@/db";
import {
  chapter,
  courseMember,
  courseModule,
  session,
  videoData,
} from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { ChapterInfoSchema } from "@/validations/chapter-info";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const {
      chapterName,
      chapterDescription,
      chapterSlug,
      isFree,
      resourceData,
      moduleId,
      duration,
      type,
      updateVideo,
    } = await request.json();

    const parsedData = ChapterInfoSchema.safeParse({
      chapterName,
      chapterSlug,
      chapterDescription,
      isFree,
      resourceData,
      moduleId,
      courseId: params.courseId,
      duration,
      type,
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

    const chapterExists = await db.query.chapter.findFirst({
      where: eq(chapter.id, params.chapterId),
      columns: { id: true },
    });

    if (!chapterExists) {
      return Response.json({
        error: {
          code: "invalid_chapter_id",
          message: "Please enter a valid chapterId",
        },
      });
    }

    await db
      .update(chapter)
      .set({
        title: parsedData.data.chapterName,
        description: parsedData.data.chapterDescription,
        slug: parsedData.data.chapterSlug,
        isFree: parsedData.data.isFree,
        type: parsedData.data.type,
      })
      .where(eq(chapter.id, params.chapterId));

    if (updateVideo) {
      await db
        .update(videoData)
        .set({
          playbackId: parsedData.data.resourceData,
          duration: parsedData.data.duration,
        })
        .where(eq(videoData.chapterId, params.chapterId));
    }
    return Response.json({ success: true });
  } catch (error) {
    console.log(
      "Error while editing chapter",
      params.courseId,
      params.chapterId,
      error
    );

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
  { params }: { params: { courseId: string; chapterId: string } }
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

    const chapterExists = await db.query.chapter.findFirst({
      where: eq(chapter.id, params.chapterId),
      columns: { id: true },
    });

    if (!chapterExists) {
      return Response.json({
        error: {
          code: "invalid_chapter_id",
          message: "Please enter a valid chapterId",
        },
      });
    }

    //! FIX ME: DELETE VIDEOS

    await db.delete(chapter).where(eq(chapter.id, params.chapterId));
    return Response.json({ success: true });
  } catch (error) {
    console.log(
      "Error while deleting chapter",
      params.courseId,
      params.chapterId,
      error
    );

    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
