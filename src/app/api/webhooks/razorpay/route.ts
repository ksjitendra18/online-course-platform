import { db } from "@/db";
import { course, courseEnrollment, purchase, user } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { createHmac } from "node:crypto";
export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      return Response.json(
        {
          error: "webhook_secret_missing",
        },
        { status: 500 }
      );
    }

    const webhookBody = await request.json();

    if (webhookBody.event === "payment.captured") {
      const razorPaySignature = headers().get("X-RazorPay-Signature");

      const stringifiedBody = JSON.stringify(webhookBody);
      const generatedSignature = createHmac("sha256", webhookSecret)
        .update(stringifiedBody)
        .digest("hex");

      if (generatedSignature === razorPaySignature) {
        const courseData = await db.query.course.findFirst({
          columns: {
            id: true,
            title: true,
          },
          where: eq(
            course.id,
            webhookBody?.payload?.payment.entity.notes.courseId
          ),
        });

        const userData = await db.query.user.findFirst({
          columns: {
            id: true,
            name: true,
            email: true,
          },
          where: eq(user.id, webhookBody?.payload?.payment.entity.notes.userId),
        });

        if (!courseData || !userData) {
          return Response.json({ success: false });
        }

        await db.insert(purchase).values({
          courseId: courseData.id,
          coursePrice: webhookBody?.payload?.payment.entity.amount / 100,
          userId: userData.id,
          razorpayPaymentId: webhookBody?.payload?.payment.entity.id,
          razorpayOrderId: webhookBody?.payload?.payment.entity.order_id,
        });

        await db.insert(courseEnrollment).values({
          courseId: courseData.id,
          userId: userData.id,
        });
        await fetch("https://api.zeptomail.in/v1.1/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${process.env.ZOHO_MAIL_TOKEN}`,
          },
          body: JSON.stringify({
            from: { address: "orders-donotreply@learningapp.link" },
            to: [
              {
                email_address: {
                  address: userData.email,
                },
              },
            ],
            subject: `Order Confirmation`,
            htmlbody: `<h2>
            Start your learning journey
            </h2>
            <p>Course <span>${
              courseData.title
            }</span>purchased successfully for ${formatPrice(
              webhookBody?.payload?.payment.entity.amount / 100
            )}</p>
          `,
          }),
        });
        return Response.json({ success: true });
      } else {
        return Response.json(
          { error: { code: "server_error", message: "Server Error" } },
          { status: 500 }
        );
      }
    } else {
      return Response.json(
        { error: { code: "server_error", message: "Server Error" } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("error in webhooks", error);
    return Response.json({ message: "server_erorr" }, { status: 500 });
  }
}
