import { cookies } from "next/headers";

import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { EncryptionPurpose, aesEncrypt } from "@/lib/aes";
import { create2FASession, createLoginLog, createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { env } from "@/utils/env/server";
import LoginSchema from "@/validations/login";

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

    const EMAIL_LIMIT_OPTIONS = {
      key: `${email}:la`,
      limit: 100,
      duration: 86400,
    };
    const IP_LIMIT_OPTIONS = {
      key: `${userIP}:la`,
      limit: 50,
      duration: 86400,
    };
    const IP_HOUR_LIMIT_OPTIONS = {
      key: `${userIP}:hla`,
      limit: 20,
      duration: 3600,
    };

    const emailRateLimit = rateLimit(EMAIL_LIMIT_OPTIONS);
    const ipRateLimit = rateLimit(IP_LIMIT_OPTIONS);
    const ipHourRateLimit = rateLimit(IP_HOUR_LIMIT_OPTIONS);

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
      columns: { id: true, emailVerified: true, twoFactorEnabled: true },
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

    if (userExists.twoFactorEnabled) {
      const faSess = await create2FASession(userExists.id);

      cookies().set("login_method", "credentials", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      });

      cookies().set("2fa_auth", faSess, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      });

      return Response.json(
        { message: "2FA required", redirect: "/two-factor/totp/verify" },
        {
          status: 302,
        }
      );
    }
    const userAgent = request.headers.get("user-agent") as string;

    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";

    const { expiresAt, sessionId } = await createSession({
      userId: userExists.id,
    });

    await createLoginLog({
      sessionId,
      userAgent: userAgent,
      strategy: "credentials",
      userId: userExists.id,
      ip: userIp,
    });

    const encryptedSessionId = aesEncrypt(
      sessionId,
      EncryptionPurpose.SESSION_COOKIE
    );

    cookies().set("auth-token", encryptedSessionId, {
      sameSite: "lax",
      expires: expiresAt,
      domain: env.NODE_ENV === "production" ? ".learningapp.link" : "localhost",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    });
    return Response.json({ success: true });
  } catch (error) {
    console.log("error LOGIN", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
