import { and, eq } from "drizzle-orm";
import Razorpay from "razorpay";

import { db } from "@/db";
import { getDiscountedPrice } from "@/db/queries/discount";
import { course } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { env } from "@/utils/env/server";

export async function POST(request: Request) {
  console.log("key", env.RAZORPAY_KEY, env.RAZORPAY_KEY);

  const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY!,
    key_secret: env.RAZORPAY_SECRET,
  });

  const { courseId, discountCode } = await request.json();

  if (!courseId) {
    return Response.json(
      {
        error: {
          code: "missing_field",
          message: "Course ID is required",
          missing: ["courseId"],
        },
      },
      { status: 400 }
    );
  }

  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const courseData = await db.query.course.findFirst({
      where: and(eq(course.id, courseId), eq(course.status, "published")),
      columns: {
        id: true,
        price: true,
      },
    });

    if (!courseData) {
      return Response.json(
        {
          error: { code: "not_found", message: "Course not found" },
        },
        { status: 404 }
      );
    }

    if (!courseData.price) {
      return Response.json(
        {
          error: { code: "free_course", message: "This course is free" },
        },
        { status: 400 }
      );
    }

    const { newPrice, discountData } = await getDiscountedPrice({
      courseId: courseData.id,
      code: discountCode,
    });

    const payment_capture = 1;
    const amount = newPrice;
    const currency = "INR";
    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: crypto.randomUUID(),
      payment_capture,
      notes: {
        courseId: courseId,
        userId: userInfo.id,
        discountCode: discountCode,
        // boolean here is giving typescript error
        discountCodeUsed: discountData ? 1 : 0,
        discountCodeId: discountData?.id ?? null,
      },
    };
    const response = await razorpay.orders.create(options);
    return Response.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    console.log("err while payment razorpay", err);
    // Response.json(err, { status: 400 });
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
