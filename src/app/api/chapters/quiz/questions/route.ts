import { db } from "@/db";
import { chapter, courseMember, quiz, session } from "@/db/schema";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const courseId = params.get("courseId");
    const moduleId = params.get("moduleId");
    const chapterSlug = params.get("chapterSlug");

    // check if user is valid
    const token = cookies().get("auth-token")?.value;
    if (!token || !courseId || !moduleId || !chapterSlug) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, token),
      columns: { id: true },
      with: {
        user: {
          columns: { id: true },
          with: {
            organizationMember: {
              columns: { id: true },
            },
          },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    // const userOrgInfo = sessionExists.user.organizationMember.filter(
    //   (org) => org.role === "owner"
    // );

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
