import { courseEnrollment, purchase, session, user } from "@/db/schema";
import { db } from "@/db/index";
import { createId } from "@paralleldrive/cuid2";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    await db.insert(purchase).values({
      courseId: courseId,
      coursePrice,
      userId: sessionExists.user.id,
      razorpayOrderId,
      razorpayPaymentId,
    });

    await db.insert(courseEnrollment).values({
      courseId,
      userId: sessionExists.user.id,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while checkout", error);
    return Response.json({
      error: { code: "server_error", message: "Server Error" },
    });
  }
}
