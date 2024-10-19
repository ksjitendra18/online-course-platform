import { NextResponse } from "next/server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { course, courseModule } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";

const CompleteCourseSchema = z
  .object({
    id: z.string().min(1),
    organizationId: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    imageUrl: z.string().min(1),
    price: z.number().min(0),
    validity: z.number(),
    status: z.enum(["draft", "published", "archived", "deleted"]),
    level: z.string().min(1),
    isFree: z.boolean(),
    createdAt: z.number().min(1),
    updatedAt: z.number().min(1),
    courseCategory: z.array(
      z.object({
        categoryId: z.string().min(1),
      })
    ),
  })
  .superRefine((val, ctx) => {
    if (!val.isFree) {
      if (val.price < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coursePrice"],
          message: "Course Price should be greater than zero",
        });
      }
    }
  });

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;

  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: courseId,
      userId: userInfo.id,
    });

    const courseInfo = await db.query.course.findFirst({
      where: eq(course.id, courseId),
      columns: {
        id: true,
        isFree: true,
      },
    });

    if (!isAuthorized || !courseInfo) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    // check if the course could be published
    // criteria:
    // should have all the details filled
    // validate it with a zod schema
    // atleast one published module (which automatically means atleast one published chapter)

    const courseData = await db.query.course.findFirst({
      where: eq(course.id, courseId),
      with: {
        courseCategory: {
          columns: {
            categoryId: true,
          },
        },
      },
    });

    const result = await db.query.courseModule.findMany({
      columns: { id: true },
      where: and(
        eq(courseModule.courseId, courseId),
        eq(courseModule.status, "published")
      ),
      limit: 1,
    });

    const hasPublishedModule = result.length > 0;

    const validCourseData = CompleteCourseSchema.safeParse(courseData);

    if (!validCourseData.success) {
      const missingOrInvalid = validCourseData.error.issues.map((issue) => ({
        field: issue.path.join("."),
        type: issue.code,
      }));

      const missing = missingOrInvalid
        .filter(
          (item) =>
            item.type === "invalid_type" && item.field !== "courseCategory"
        )
        .map((item) => item.field);

      const invalid = missingOrInvalid
        .filter(
          (item) =>
            item.type !== "invalid_type" || item.field === "courseCategory"
        )
        .map((item) => item.field);

      return Response.json(
        {
          error: {
            code: "validation_error",
            message: "Please check missing fields and invalid fields",
            missingFields: missing,
            invalidFields: invalid,
            hasPublishedModule: hasPublishedModule,
          },
        },
        { status: 400 }
      );
    }

    if (!hasPublishedModule) {
      return Response.json(
        {
          error: {
            code: "unpublished_modules",
            message: "Please publish at least one module",
            hasPublishedModule: hasPublishedModule,
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ data: { hasPublishedModule } });
  } catch (error) {
    console.error("Error checking published module status:", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
