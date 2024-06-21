import { eq } from "drizzle-orm";
import { course, courseMember, session } from "@/db/schema";
import { BasicInfoSchema } from "@/validations/basic-info";
import { cookies } from "next/headers";
import { db } from "@/db";

export async function POST(request: Request) {
  try {
    const { courseName, courseSlug, courseDescription, isFree, level } =
      await request.json();

    const parsedData = BasicInfoSchema.safeParse({
      courseName,
      courseSlug,
      courseDescription,
      isFree,
      level,
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

        { status: 401 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, token),
      columns: { id: true },
      with: {
        user: {
          columns: { id: true },
          with: {
            organizationMember: true,
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

    const userOrgInfo = sessionExists.user.organizationMember.filter(
      (org) => org.role === "owner" || org.role === "admin"
    );

    const slugExists = await db.query.course.findFirst({
      where: eq(course.slug, parsedData.data.courseSlug),
      columns: { id: true },
    });

    if (slugExists) {
      return Response.json(
        {
          error: {
            code: "slug_already_exists",
            message:
              "A course with this slug already exists for the given course.",
          },
        },
        { status: 409 }
      );
    }

    const newCourse = await db
      .insert(course)
      .values({
        title: parsedData.data.courseName,
        slug: parsedData.data.courseSlug,
        description: parsedData.data.courseDescription,
        organizationId: userOrgInfo[0].organizationId,
        isFree: parsedData.data.isFree,
        level: parsedData.data.level,
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
        error: {
          code: "server_error",
          message: "Internal Server Error. Please try again",
        },
      },
      { status: 500 }
    );
  }
}
