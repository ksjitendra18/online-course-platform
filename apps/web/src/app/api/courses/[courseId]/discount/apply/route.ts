import { and, eq, isNull, lt, lte, or } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { course, courseDiscount, discount } from "@/db/schema";

const DiscountSchema = z.object({
  code: z.string(),
});

export async function POST(request: Request, props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  try {
    const requestBody = await request.json();

    const parsedData = DiscountSchema.safeParse(requestBody);

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

    const courseExists = await db.query.course.findFirst({
      where: and(
        eq(course.id, params.courseId),
        eq(course.status, "published")
      ),
      columns: { id: true },
      with: {
        courseDiscount: {
          with: {
            discount: true,
          },
        },
      },
    });

    if (!courseExists) {
      return Response.json(
        { error: { code: "invalid_course", message: "Invalid Course" } },
        { status: 400 }
      );
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const discountQuery = await db
      .select({
        discountValue: discount.discountValue,
        type: discount.type,
        isGlobal: discount.isGlobal,
      })
      .from(discount)
      .leftJoin(courseDiscount, eq(discount.id, courseDiscount.discountId))
      .where(
        and(
          eq(discount.code, parsedData.data.code),
          eq(discount.isActive, true),
          or(
            eq(discount.isGlobal, true),
            eq(courseDiscount.courseId, params.courseId)
          ),
          lte(discount.activeFrom, currentTimestamp),
          or(
            isNull(discount.usageLimit),
            lt(discount.currentUsage, discount.usageLimit)
          ),
          or(
            isNull(discount.validTill),
            lte(discount.validTill, currentTimestamp)
          )
        )
      );

    if (!discountQuery.length) {
      return Response.json(
        {
          error: "not_found",
          message: "Discount not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        discountValue: discountQuery[0].discountValue,
        type: discountQuery[0].type,
      },
    });
  } catch (error) {
    console.log("error while applying discount", error);
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
