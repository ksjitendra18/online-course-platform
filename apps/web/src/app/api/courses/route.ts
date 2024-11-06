import { cookies } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course, courseLogs, courseMember, session } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt } from "@/lib/aes";
import { BasicInfoSchema } from "@/validations/basic-info";

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    const parsedData = BasicInfoSchema.safeParse(requestBody);

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
    const token = (await cookies()).get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },

        { status: 401 }
      );
    }

    const decryptedToken = aesDecrypt(token, EncryptionPurpose.SESSION_COOKIE);
    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, decryptedToken),
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
        { status: 401 }
      );
    }

    // ! GET USER ORGANIZATION INFO
    // CURRENTLY WE ARE SELECTING THE VERY FIRST ORGANIZATION
    const userOrgInfo = sessionExists.user.organizationMember.filter(
      (org) => org.role === "owner" || org.role === "admin"
    );

    if (userOrgInfo.length === 0) {
      return Response.json(
        {
          error: {
            code: "unauthorized",
            message: "You are not authorized to create a course",
          },
        },
        { status: 403 }
      );
    }

    const slugExists = await db.query.course.findFirst({
      where: eq(course.slug, parsedData.data.slug),
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

    await db.transaction(async (trx) => {
      const newCourse = await trx
        .insert(course)
        .values({
          title: parsedData.data.title,
          slug: parsedData.data.slug,
          description: parsedData.data.description,
          organizationId: userOrgInfo[0].organizationId,
          isFree: parsedData.data.isFree,
          level: parsedData.data.level,
          status: "draft",
        })
        .returning({ id: course.id, slug: course.slug });

      await trx.insert(courseMember).values({
        courseId: newCourse[0].id,
        userId: userOrgInfo[0].userId,
        role: "owner",
      });

      await trx.insert(courseLogs).values({
        courseId: newCourse[0].id,
        userId: userOrgInfo[0].userId,
        action: "create",
      });
    });

    return Response.json(
      { data: { courseSlug: parsedData.data.slug } },
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
