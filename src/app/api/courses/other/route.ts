import { db } from "@/db/index";
import { and, eq } from "drizzle-orm";
import { course, courseCategory, courseMember, session } from "@/db/schema";
import { cookies } from "next/headers";
import { OtherInfoSchema } from "@/validations/other-info";

export async function POST(request: Request) {
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
      { error: "unauthenticated", message: "Login" },
      { status: 403 }
    );
  }

  const sessionExists = await db.query.session.findFirst({
    where: eq(session.id, token),
    with: {
      user: {
        with: {
          organizationMember: true,
        },
      },
    },
  });

  if (!sessionExists) {
    return Response.json(
      { error: "unathuenticated", message: "Login" },
      { status: 403 }
    );
  }

  const courseMemberInfo = await db.query.courseMember.findFirst({
    where: and(
      eq(courseMember.userId, sessionExists.user.id),
      eq(courseMember.courseId, courseId)
    ),
    with: {
      course: true,
    },
  });

  if (!courseMemberInfo) {
    return Response.json(
      { error: "unauthorized", message: "Forbidden" },
      { status: 403 }
    );
  }

  const parseResult = OtherInfoSchema.safeParse({
    teacherName,
    courseIsFree,
    coursePrice,
    courseCategoryId,
    courseImg,
  });

  if (!parseResult.success) {
    return Response.json(
      { error: "validation_error", message: parseResult.error.format() },
      { status: 400 }
    );
  }

  try {
    await db.batch([
      db
        .update(course)
        .set({
          imageUrl: parseResult.data.courseImg,
          validity: courseValidity,
          price: parseResult.data.coursePrice,
          isPublished: true,
        })
        .where(eq(course.id, courseId)),

      db.insert(courseCategory).values({
        courseId,
        categoryId: courseCategoryId,
      }),
    ]);

    return Response.json(null, { status: 200 });
  } catch (error) {
    console.log("error while updating other course details", error);
    return Response.json(
      {
        error: "server_error",
        message: "Please try again",
      },
      { status: 500 }
    );
  }
}
