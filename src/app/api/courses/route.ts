import { eq } from "drizzle-orm";
import { course, courseMember, session } from "@/db/schema";
import { BasicInfoSchema } from "@/validations/basic-info";
import { cookies } from "next/headers";
import { db } from "@/db";

export async function POST(request: Request) {
  const { courseName, courseSlug, courseDescription, isFree } =
    await request.json();

  const parseData = BasicInfoSchema.safeParse({
    courseName,
    courseSlug,
    courseDescription,
    isFree,
  });

  if (!parseData.success) {
    return Response.json(
      { error: "validation_error", message: parseData.error.format() },
      { status: 400 }
    );
  }

  // check if user is valid
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    return Response.json(
      { error: "unathuenticated", message: "Login" },
      { status: 401 }
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

  const userOrgInfo = sessionExists.user.organizationMember.filter(
    (org) => org.role === "owner" || org.role === "admin"
  );

  // TODO: check if slug exists
  try {
    const newCourse = await db
      .insert(course)
      .values({
        title: parseData.data.courseName,
        slug: parseData.data.courseSlug,
        description: parseData.data.courseDescription,
        organizationId: userOrgInfo[0].organizationId,
        isFree: parseData.data.isFree,
      })
      .returning({ id: course.id, slug: course.slug });

    await db.insert(courseMember).values({
      courseId: newCourse[0].id,
      userId: userOrgInfo[0].userId,
      role: "owner",
    });
    return Response.json(
      { data: { courseId: newCourse[0].id, courseSlug: newCourse[0].slug } },
      { status: 201 }
    );
  } catch (error) {
    console.log("error while creating new course", error);
    return Response.json(
      {
        error: "server_error",
        message: "Please try again",
      },
      { status: 500 }
    );
  }
}
