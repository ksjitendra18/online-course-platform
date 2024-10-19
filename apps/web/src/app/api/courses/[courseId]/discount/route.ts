import { db } from "@/db";
import { discount } from "@/db/schema";
import { courseDiscount } from "@/db/schema/course-discount";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { DiscountSchema } from "@/validations/discount";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
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

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: params.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    await db.transaction(async (trx) => {
      const [newDiscount] = await trx
        .insert(discount)
        .values({
          code: parsedData.data.code,
          type: parsedData.data.discountType,
          discountValue: parsedData.data.discountValue,
          usageLimit: parsedData.data.usageLimitValue,
          activeFrom: parsedData.data.activeFromValue,
          validTill: parsedData.data.timeLimitValue,
          isActive: true,
        })
        .returning({ id: discount.id });

      await trx.insert(courseDiscount).values({
        courseId: params.courseId,
        discountId: newDiscount.id,
      });
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while creating new discount", error);
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
