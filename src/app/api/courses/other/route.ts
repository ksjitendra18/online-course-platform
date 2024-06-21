import { db } from "@/db/index";
import { and, eq } from "drizzle-orm";
import { course, courseCategory, courseMember, session } from "@/db/schema";
import { cookies } from "next/headers";
import { OtherInfoSchema } from "@/validations/other-info";

export async function POST(request: Request) {
  try {
    const {
      courseId,
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategoryId,
      courseValidity,
      courseImg,
    } = await request.json();

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

    const courseMemberInfo = await db.query.courseMember.findFirst({
      where: and(
        eq(courseMember.userId, sessionExists.user.id),
        eq(courseMember.courseId, courseId)
      ),
      with: {
        course: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!courseMemberInfo) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const parsedResult = OtherInfoSchema.safeParse({
      teacherName,
      courseIsFree,
      coursePrice,
      courseCategoryId,
      courseImg,
    });

    if (!parsedResult.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedResult.error.format(),
          },
        },
        { status: 400 }
      );
    }

    await db.batch([
      db
        .update(course)
        .set({
          imageUrl: parsedResult.data.courseImg,
          validity: courseValidity,
          price: parsedResult.data.coursePrice,
          isPublished: true,
        })
        .where(eq(course.id, courseId)),

      db.insert(courseCategory).values({
        courseId,
        categoryId: courseCategoryId,
      }),
    ]);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("error while updating other course details", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Please try again" },
      },
      { status: 500 }
    );
  }
}
