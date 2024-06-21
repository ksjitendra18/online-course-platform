import { db } from "@/db";
import { course, session } from "@/db/schema";
import { discussion } from "@/db/schema/discussion";
import DiscussionSchema from "@/validations/discussion";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
    const token = cookies().get("auth-token")?.value;
    if (!token) {
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
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
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
      userId: sessionExists.user.id,
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
