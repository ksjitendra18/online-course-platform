import { cookies } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course, session } from "@/db/schema";
import { discussion } from "@/db/schema/discussion";
import { checkAuth } from "@/lib/auth";
import DiscussionSchema from "@/validations/discussion";

export async function POST(request: Request) {
  try {
    const { question, description, courseId } = await request.json();

    const parsedData = DiscussionSchema.safeParse({
      question,
      description,
      courseId,
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

    const courseExists = await db.query.course.findFirst({
      where: eq(course.id, parsedData.data.courseId),
      columns: { id: true },
    });

    if (!courseExists) {
      return Response.json(
        {
          error: {
            code: "invalid_course_id",
            message: "Please enter a valid course ID",
          },
        },
        { status: 404 }
      );
    }

    await db.insert(discussion).values({
      courseId: parsedData.data.courseId,
      question: parsedData.data.question,
      description: parsedData.data.description,
      userId: userInfo.id,
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log(`error POST Discussions `, error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
