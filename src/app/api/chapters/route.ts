import { and, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { chapter, videoData } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { ChapterInfoSchema } from "@/validations/chapter-info";

export async function POST(request: Request) {
  const {
    moduleId,
    courseId,
    chapterSlug,
    chapterName,
    chapterDescription,
    resourceData,
    isFree,
    duration,
    type,
  } = await request.json();
  try {
    const parsedData = ChapterInfoSchema.safeParse({
      moduleId,
      courseId,
      chapterName,
      chapterSlug,
      chapterDescription,
      resourceData,
      isFree,
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
      courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const chapterExists = await db.query.chapter.findFirst({
      columns: { id: true },
      where: and(
        eq(chapter.moduleId, parsedData.data.moduleId),
        eq(chapter.slug, parsedData.data.chapterSlug)
      ),
    });

    if (chapterExists) {
      return Response.json(
        {
          error: {
            code: "slug_exists",
            message: "Slug already exists. Please choose another",
          },
        },
        { status: 400 }
      );
    }

    const allChapters = await db
      .select({ count: count(chapter.id) })
      .from(chapter)
      .where(eq(chapter.courseId, courseId));

    const moduleChapters = await db
      .select({ count: count(chapter.id) })
      .from(chapter)
      .where(eq(chapter.moduleId, moduleId));

    if (parsedData.data.type === "video") {
      const newChapter = await db
        .insert(chapter)
        .values({
          moduleId: moduleId,
          position: allChapters[0].count + 1,
          modulePosition: moduleChapters[0].count + 1,
          description: parsedData.data.chapterDescription,
          title: parsedData.data.chapterName,
          slug: parsedData.data.chapterSlug,
          isFree: parsedData.data.isFree,
          type: parsedData.data.type,
          status: "draft",
          courseId,
        })
        .returning({ id: chapter.id });

      await db.insert(videoData).values({
        chapterId: newChapter[0].id,
        courseId: courseId,
        duration: parsedData.data.duration,
        playbackId: parsedData.data.resourceData,
      });
    } else if (parsedData.data.type === "quiz") {
      await db.insert(chapter).values({
        moduleId: moduleId,
        position: allChapters[0].count + 1,
        modulePosition: moduleChapters[0].count + 1,
        description: parsedData.data.chapterDescription,
        title: parsedData.data.chapterName,
        slug: parsedData.data.chapterSlug,
        isFree: parsedData.data.isFree,
        type: parsedData.data.type,
        status: "draft",
        courseId,
      });
    }

    return Response.json(null, { status: 201 });
  } catch (error) {
    console.log("Error while creating chapter.");
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
