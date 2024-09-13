import { db } from "@/db";
import { user } from "@/db/schema";
import { sendMagicLink } from "@/lib/auth";
import EmailSchema from "@/validations/email";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const parsedData = EmailSchema.safeParse(email);
    if (!parsedData.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: "Invalid email",
          },
        },
        { status: 400 }
      );
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.email, parsedData.data),
    });

    if (!userExists) {
      return Response.json(
        {
          error: {
            code: "user_not_found",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const res = await sendMagicLink({
      email: parsedData.data,
      url: process.env.NEXT_PUBLIC_BASE_URL!,
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
      return Response.json(null, { status: 200 });
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
  } catch (error) {
    console.log("Error while sending magic link", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
