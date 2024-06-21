import { db } from "@/db";
import { course, session } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY!,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const { courseId } = await request.json();

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

    const courseData = await db.query.course.findFirst({
      where: eq(course.id, courseId),
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

    const payment_capture = 1;
    const amount = courseData.price!;
    const currency = "INR";
    const options = {
      amount: (amount * 100).toString(),
      currency,
      receipt: crypto.randomUUID(),
      payment_capture,
      notes: {
        courseId: courseId,
        userId: sessionExists.user.id,
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
