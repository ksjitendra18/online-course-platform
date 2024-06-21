import { db } from "@/db";
import { chapter, courseMember, session, videoData } from "@/db/schema";
import { ChapterInfoSchema } from "@/validations/chapter-info";

import { and, count, eq } from "drizzle-orm";
import { cookies } from "next/headers";

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

    // check if user is valid
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      columns: { id: true, active: true },
      where: eq(session.id, token),
      with: {
        user: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.courseId, courseId),
        eq(courseMember.userId, sessionExists.user.id)
      ),
      with: {
        course: {
          columns: { id: true },
        },
      },
    });

    if (!courseMemberInfo) {
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
          courseId,
        })
        .returning({ id: chapter.id });
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
