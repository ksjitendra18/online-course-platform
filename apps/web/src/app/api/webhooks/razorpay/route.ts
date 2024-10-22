import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";
import { createHmac } from "node:crypto";

import { db } from "@/db";
import {
  course,
  courseEnrollment,
  discount,
  purchase,
  user,
} from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { env } from "@/utils/env/server";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

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
      const razorPaySignature = (await headers()).get("X-RazorPay-Signature");

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

        if (
          Boolean(
            webhookBody?.payload?.payment.entity.notes.discountCodeUsed
          ) &&
          webhookBody?.payload?.payment.entity.notes.discountCodeId !== null
        ) {
          await db.transaction(async (trx) => {
            await trx.insert(purchase).values({
              courseId: courseData.id,
              coursePrice: webhookBody?.payload?.payment.entity.amount / 100,
              userId: userData.id,
              razorpayPaymentId: webhookBody?.payload?.payment.entity.id,
              razorpayOrderId: webhookBody?.payload?.payment.entity.order_id,
              discountUsed: true,
              discountCode:
                webhookBody?.payload?.payment.entity.notes.discountCode,
            });

            const discountData = await trx.query.discount.findFirst({
              where: eq(
                discount.id,
                webhookBody?.payload?.payment.entity.notes.discountCodeId
              ),
              columns: {
                id: true,
                currentUsage: true,
              },
            });

            // quite sure that discount data will exist
            if (discountData) {
              await trx
                .update(discount)
                .set({
                  currentUsage: discountData.currentUsage + 1,
                })
                .where(eq(discount.id, discountData.id));
            }
          });
        } else {
          await db.insert(purchase).values({
            courseId: courseData.id,
            coursePrice: webhookBody?.payload?.payment.entity.amount / 100,
            userId: userData.id,
            razorpayPaymentId: webhookBody?.payload?.payment.entity.id,
            razorpayOrderId: webhookBody?.payload?.payment.entity.order_id,
          });
        }

        await db.insert(courseEnrollment).values({
          courseId: courseData.id,
          userId: userData.id,
        });
        await fetch("https://api.zeptomail.in/v1.1/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${env.ZOHO_MAIL_TOKEN}`,
          },
          body: JSON.stringify({
            from: {
              name: `${env.FROM_NAME}`,
              address: `${env.ORDER_EMAIL_ADDRESS}`,
            },
            to: [
              {
                email_address: {
                  address: userData.email,
                },
              },
            ],
            subject: "Order Confirmation",
            htmlbody: `<h2>
            Start your learning journey
            </h2>
            <p>Course <span>${
              courseData.title
            }</span> purchased successfully for ${formatPrice(
              webhookBody?.payload?.payment.entity.amount / 100
            )}</p>

            <p>You have been enrolled in <span>${
              courseData.title
            }</span> on LearningApp.</p>
            <p>Track your progress and get involved with other learners via discussions tab.</p>
            

            <p>You have received this email because you have purchased <span>${
              courseData.title
            }</span> on LearningApp.</p>
            <p>If you think this is a mistake, please contact us at <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>.</p>
          `,
          }),
        });

        revalidateTag("get-enrolled-courses");
        revalidateTag("get-total-enrollments");

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
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
