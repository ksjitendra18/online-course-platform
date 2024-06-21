import { db } from "@/db";
import { user } from "@/db/schema";
import { createLoginLog, createSession } from "@/lib/auth";
import LoginSchema from "@/validations/login";
// import { verify } from "@node-rs/argon2";
import { verify } from "argon2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    email,
    password,
  }: {
    email: string;
    password: string;
  } = await request.json();

  try {
    const parsedData = LoginSchema.safeParse({
      email,
      password,
    });

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
      columns: { id: true, emailVerified: true },
      where: eq(user.email, email),
      with: {
        password: true,
      },
    });

    if (!userExists || !userExists.password) {
      return Response.json(
        {
          error: {
            code: "auth_error",
            message: "Please check email and password",
          },
        },
        { status: 400 }
      );
    }

    if (!userExists.emailVerified) {
      return Response.json(
        {
          error: {
            code: "email_unverified",
            message: "Please verify your email",
          },
        },
        { status: 403 }
      );
    }

    // const validPassword = await bcrypt.compare(
    //   parsedData.data.password,
    //   userExists.password.password
    // );

    console.log("okay", userExists.password.password, parsedData.data.password);

    const validPassword = await verify(
      userExists.password.password,
      parsedData.data.password
    );

    if (!validPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        {
          status: 400,
        }
      );
    }

    const userAgent = request.headers.get("user-agent") as string;

    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";

    const { expiresAt, sessionId } = await createSession({
      userAgent,
      userId: userExists.id,
      userIp,
    });

    await createLoginLog({
      sessionId,
      userAgent: userAgent,
      userId: userExists.id,
      ip: userIp,
    });

    cookies().set("auth-token", sessionId, {
      sameSite: "lax",
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return Response.json({ success: true });
  } catch (error) {
    console.log(`error LOGIN`, error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
