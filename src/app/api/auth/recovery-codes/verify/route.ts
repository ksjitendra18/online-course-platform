import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { xxh32 } from "@node-rs/xxhash";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { recoveryCodes, user } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt, aesEncrypt } from "@/lib/aes";
import { createLoginLog, createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import redis from "@/lib/redis";

// rate limiting will be on the basis of 3 things
// 1. ip address: 500 requests per hour
// 2. ip + user agent: 10 requests per hour
// 3. user id: 10 requests per hour
// . after total of 100 requests, the user will be blocked forever

export async function POST(request: NextRequest) {
  try {
    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";
    const userAgent = request.headers.get("user-agent") as string;

    const IP_LIMIT = {
      key: xxh32(`${userIp}:recov_code`).toString(16),
      limit: 500,
      duration: 3600,
    };

    const IP_UA_LIMIT = {
      key: xxh32(`${userIp}:${userAgent}:recov_code`).toString(16),
      limit: 10,
      duration: 3600,
    };

    const ipRateLimit = rateLimit(IP_LIMIT);
    const ipUaRateLimit = rateLimit(IP_UA_LIMIT);

    const [ipRateLimitRes, ipUaRateLimitRes] = await Promise.all([
      ipRateLimit,
      ipUaRateLimit,
    ]);

    if (
      ipRateLimitRes instanceof Response ||
      ipUaRateLimitRes instanceof Response
    ) {
      return ipRateLimitRes || ipUaRateLimitRes;
    }

    const { enteredCode } = await request.json();

    if (!enteredCode || enteredCode.length != 14) {
      return Response.json(
        {
          error: "validation_error",
          message: "Enter a valid code",
        },
        { status: 400 }
      );
    }

    const twoFaToken = cookies().get("2fa_auth")?.value;

    if (!twoFaToken) {
      return Response.json(
        { error: "authentication_error", message: "Log in" },
        {
          status: 401,
        }
      );
    }

    const userId = await redis.get(
      xxh32(`2fa_auth:${twoFaToken}`).toString(16)
    );

    if (!userId) {
      return Response.json(
        { error: "authentication_error", message: "Log in" },
        {
          status: 401,
        }
      );
    }

    const userExists = await db.query.user.findFirst({
      where: and(eq(user.id, userId as string)),
      with: {
        recoveryCodes: {
          where: eq(recoveryCodes.isUsed, false),
        },
      },
    });

    if (!userExists || userExists.recoveryCodes.length < 1) {
      return Response.json(
        { error: "authentication_error", message: "Log in" },
        {
          status: 401,
        }
      );
    }

    const USERID_HOUR_LIMIT = {
      key: xxh32(`${userExists.id}:recov_code`).toString(16),
      limit: 20,
      duration: 3600,
    };

    const USERID_LIMIT = {
      key: xxh32(`${userExists.id}:recov_code`).toString(16),
      limit: 50,
      duration: -1, // infinity
    };

    const userIdHourLimit = rateLimit(USERID_HOUR_LIMIT);
    const userIdLimit = rateLimit(USERID_LIMIT);

    const [userIdHourLimitRes, userIdLimitRes] = await Promise.all([
      userIdHourLimit,
      userIdLimit,
    ]);

    if (userIdHourLimitRes instanceof Response) {
      return userIdHourLimitRes;
    }

    if (userIdLimitRes instanceof Response) {
      await db
        .update(user)
        .set({ isBlocked: true })
        .where(eq(user.id, userExists.id));
      return userIdLimitRes;
    }

    let isValidCode = false;
    for (const recoveryCode of userExists.recoveryCodes) {
      const decryptedCode = aesDecrypt(
        recoveryCode.code,
        EncryptionPurpose.RECOVERY_CODE
      );

      if (decryptedCode === enteredCode) {
        await db
          .update(recoveryCodes)
          .set({
            isUsed: true,
          })
          .where(eq(recoveryCodes.id, recoveryCode.id));
        isValidCode = true;
      }
    }

    if (!isValidCode) {
      return Response.json(
        {
          error: "verification_error",
          message: "Error while verifying recovery code. Try another one.",
        },
        { status: 400 }
      );
    }

    const { sessionId, expiresAt } = await createSession({
      userId: userExists.id,
    });

    const validStrategies = ["google", "credentials", "magic_link"] as const;
    type LoginStrategy = (typeof validStrategies)[number];

    const loginMethod = cookies().get("login_method")?.value;
    const strategy: LoginStrategy = validStrategies.includes(
      loginMethod as LoginStrategy
    )
      ? (loginMethod as LoginStrategy)
      : "credentials";

    await createLoginLog({
      sessionId,
      userAgent: request.headers.get("user-agent"),
      userId: userExists.id,
      ip: userIp ?? "dev",
      strategy: strategy,
    });

    cookies().delete("2fa_auth");

    const encryptedCookie = aesEncrypt(
      sessionId,
      EncryptionPurpose.SESSION_COOKIE
    );

    cookies().set("auth-token", encryptedCookie, {
      path: "/",
      httpOnly: true,
      expires: expiresAt,
      domain: env.NODE_ENV === "production" ? ".learningapp.link" : "localhost",
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
    });

    await redis.del(`2fa_auth:${twoFaToken}`);

    return Response.json(
      { message: "Logged In Successfully", redirect: "/dashboard" },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("Error while verifying recovery code", err);
    return Response.json(
      {
        error: "server_error",
        message: "Internal server Error. Please try again later",
      },
      { status: 500 }
    );
  }
}
