import { db } from "@/db";
import { user } from "@/db/schema";
import { createLoginLog, createSession } from "@/lib/auth";
import { encryptCookie } from "@/lib/cookies";
import { rateLimit } from "@/lib/ratelimit";
import LoginSchema from "@/validations/login";

import { verify } from "argon2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
    }: {
      email: string;
      password: string;
    } = await request.json();

    const userIP = request.headers.get("X-Forwarded-For") ?? "dev";

    const emailRateLimit = rateLimit(`${email}:la`, 100, 86400);
    const ipRateLimit = rateLimit(`${userIP}:la`, 50, 86400);
    const ipHourRateLimit = rateLimit(`${userIP}:hla`, 20, 3600);

    const [resp1, resp2, resp3] = await Promise.all([
      emailRateLimit,
      ipRateLimit,
      ipHourRateLimit,
    ]);
    if (
      resp1 instanceof Response ||
      resp2 instanceof Response ||
      resp3 instanceof Response
    ) {
      return resp1 || resp2 || resp3;
    }

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
            code: "invalid_credentials",
            message: "Invalid email or password",
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

    const validPassword = await verify(
      userExists.password.password,
      parsedData.data.password
    );

    if (!validPassword) {
      return Response.json(
        {
          error: {
            code: "invalid_credentials",
            message: "Invalid email or password}",
          },
        },
        { status: 400 }
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

    const encryptedSessionId = await encryptCookie(sessionId);

    cookies().set("auth-token", encryptedSessionId, {
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
