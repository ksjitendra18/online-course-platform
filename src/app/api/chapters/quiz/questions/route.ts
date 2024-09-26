import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { chapter, courseMember, quiz, session } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const GetQuestionsSchema = z.object({
  courseId: z
    .string({ required_error: "Course ID is required" })
    .cuid2({ message: "Not a valid Course ID" }),
  moduleId: z
    .string({ required_error: "Module ID is required" })
    .cuid2({ message: "Not a valid Module ID" }),
  chapterSlug: z
    .string({ required_error: "Chapter Slug is required" })
    .regex(/^[a-zA-Z0-9-_]+$/, { message: "Invalid Chapter Slug" }),
});

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const parsedData = GetQuestionsSchema.safeParse({
      courseId: params.get("courseId"),
      moduleId: params.get("moduleId"),
      chapterSlug: params.get("chapterSlug"),
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

    const { courseId, moduleId, chapterSlug } = parsedData.data;

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

    const chapterExists = await db
      .select({ id: chapter.id })
      .from(chapter)
      .where(
        and(eq(chapter.moduleId, moduleId), eq(chapter.slug, chapterSlug))
      );

    const quizWithQuestion = await db.query.quiz.findFirst({
      where: eq(quiz.chapterId, chapterExists[0].id),
      with: {
        questions: {
          with: {
            answers: true,
          },
        },
      },
    });

    if (!quizWithQuestion) {
      return Response.json([], { status: 200 });
    }
    return Response.json(quizWithQuestion);
  } catch (error) {
    console.log("error while getting question", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
