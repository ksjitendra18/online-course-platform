import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { sendPasswordResetMail, sendVerificationMail } from "@/lib/auth";
import EmailSchema from "@/validations/email";

export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json();

    const parsedData = EmailSchema.safeParse(email);

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

    const userExists = await db.query.user.findFirst({
      columns: {
        id: true,
      },
      where: and(eq(user.email, parsedData.data), eq(user.isBlocked, false)),
    });

    if (!userExists) {
      return Response.json(
        {
          error: {
            code: "user_not_exist",
            message: "User with this email doesn't exist",
          },
        },
        { status: 404 }
      );
    }

    const res = await sendPasswordResetMail({
      email: parsedData.data,
      url: "https://learningapp.link",
    });

    if (res.emailSendLimit) {
      return Response.json(
        {
          error: {
            code: "rate_limit",
            message: `Please wait for 24 hrs before sending new mail request`,
          },
        },
        { status: 429 }
      );
    } else if (res.verificationId) {
      return Response.json(
        {
          message:
            "Mail Sent Successfully. Please visit the link sent in the mail to reset password",
        },
        { status: 200 }
      );
    } else if (res.waitTime) {
      return Response.json(
        {
          error: {
            code: "resend_limit",
            message: `Please wait for ${res.waitTime} minutes before generating new request for mail`,
          },
        },
        { status: 429 }
      );
    }
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  } catch (err) {
    console.log("Error while sending mail", err);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
