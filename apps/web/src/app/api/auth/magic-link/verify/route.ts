import { cookies } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { EncryptionPurpose, aesEncrypt } from "@/lib/aes";
import { create2FASession, createLoginLog, createSession } from "@/lib/auth";
import redis from "@/lib/redis";
import { env } from "@/utils/env/server";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    const redisData = await redis.get(id);

    if (!redisData) {
      return Response.json(
        {
          error: {
            code: "invalid_magic_link",
            message: "Invalid magic link or Link expired",
          },
        },
        { status: 400 }
      );
    }

    await redis.del(id);

    const userExists = await db.query.user.findFirst({
      where: eq(user.email, redisData),
    });

    if (!userExists) {
      return Response.json(
        {
          error: {
            code: "invalid_magic_link",
            message: "Invalid magic link",
          },
        },
        { status: 400 }
      );
    }

    if (userExists.twoFactorEnabled) {
      const faSess = await create2FASession(userExists.id);

      cookies().set("login_method", "magic_link", {
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
      strategy: "magic_link",
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
    console.log("Error while verifying magic link", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
