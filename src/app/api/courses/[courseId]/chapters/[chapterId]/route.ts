import { clearTagCache } from "@/actions/clear-tag-cache";
import { db } from "@/db";
import { chapter, videoData } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import redis from "@/lib/redis";
import { ChapterInfoSchema } from "@/validations/chapter-info";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const PartialChapterSchema = ChapterInfoSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const reqBody = await request.json();
    const parsedData = PartialChapterSchema.safeParse(reqBody);
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
      .set(parsedData.data)
      .where(eq(chapter.id, params.chapterId));

    if (reqBody.updateVideo) {
      if (!parsedData.data.resourceData || !parsedData.data.duration) {
        return Response.json(
          {
            error: {
              code: "invalid_resource_data",
              message: "Please enter a valid resourceData and duration",
            },
          },
          { status: 400 }
        );
      }
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
      with: {
        videoData: true,
      },
    });

    if (!chapterExists) {
      return Response.json({
        error: {
          code: "invalid_chapter_id",
          message: "Please enter a valid chapterId",
        },
      });
    }

    await redis.sadd("delete_videos", chapterExists.videoData[0].playbackId);

    await db.delete(chapter).where(eq(chapter.id, params.chapterId));

    clearTagCache("get-course-data");
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
