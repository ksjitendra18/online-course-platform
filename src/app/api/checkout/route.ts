import { purchase, session, user } from "@/db/schema";
import { db } from "@/db/index";
import { createId } from "@paralleldrive/cuid2";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    courseId,
    razorpayOrderId,
    razorpayPaymentId,
  }: {
    courseId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  } = await request.json();

  try {
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

    await db.insert(purchase).values({
      courseId: courseId,
      userId: sessionExists.user.id,
      razorpayOrderId,
      razorpayPaymentId,
      id: createId(),
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (e: any) {
    return new Response("Internal server error", { status: 500 });
  }
}
