import { courseEnrollment, purchase, session, user } from "@/db/schema";
import { db } from "@/db/index";
import { createId } from "@paralleldrive/cuid2";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { checkAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const {
    courseId,
    coursePrice,
    razorpayOrderId,
    razorpayPaymentId,
  }: {
    courseId: string;
    coursePrice: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  } = await request.json();

  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }
    await db.insert(purchase).values({
      courseId: courseId,
      coursePrice,
      userId: userInfo.id,
      razorpayOrderId,
      razorpayPaymentId,
    });

    await db.insert(courseEnrollment).values({
      courseId,
      userId: userInfo.id,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while checkout", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Server Error" },
      },
      { status: 500 }
    );
  }
}
