import { db } from "@/db";
import { user } from "@/db/schema";
import { StudentSignupSchema } from "@/validations/student-signup";

import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { password as dbPassword } from "@/db/schema";
import { sendVerificationMail, createPassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const {
    fullName,
    userName,
    email,
    password,
  }: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
  } = await request.json();

  try {
    const parsedData = StudentSignupSchema.safeParse({
      fullName,
      userName,
      email,
      password,
    });

    if (!parsedData.success) {
      return Response.json({
        error: {
          code: "validation_error",
          message: parsedData.error.format(),
        },
      });
    }

    const existingUser = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(user.email, parsedData.data.email),
    });

    if (existingUser) {
      return Response.json(
        {
          error: {
            code: "user_already_exists",
            message: "User already exists",
          },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword({
      password: parsedData.data.password,
    });
    const userId = createId();

    await db.batch([
      db.insert(user).values({
        name: parsedData.data.fullName,
        email: parsedData.data.email,
        userName: parsedData.data.userName,
        id: userId,
      }),

      db.insert(dbPassword).values({
        password: hashedPassword,
        userId,
      }),
    ]);

    const verificationResponse = await sendVerificationMail({ email });

    if (verificationResponse) {
      return Response.json(
        { data: { id: verificationResponse.verificationId } },
        { status: 201 }
      );
    } else {
      console.log("error while sending the mail");
      await db.delete(user).where(eq(user.email, email));
      return Response.json(
        {
          error: { code: "email_error", message: "Error while sending email" },
        },
        { status: 500 }
      );
    }
    // return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("Error while student signup", error);
    await db.delete(user).where(eq(user.email, email));

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
