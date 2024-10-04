import { NextRequest } from "next/server";

import { xxh64 } from "@node-rs/xxhash";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import redis from "@/lib/redis";

export async function POST(request: NextRequest) {
  const { id, code } = await request.json();

  try {
    const hashedId = xxh64(id).toString(16);

    const userIp = request.headers.get("X-Forwarded-For") ?? "dev";

    const totalVerificationAttempts = await redis.get(`${hashedId}:count`);

    console.log("totalVerificationAttempts", totalVerificationAttempts);

    if (totalVerificationAttempts !== null) {
      if (Number(totalVerificationAttempts) < 1) {
        // delete the id
        await redis.del(hashedId);
        return Response.json(
          {
            error: {
              code: "code_expired",
              message:
                "Verification code expired. Please generate a new verification code.",
            },
          },
          { status: 400 }
        );
      } else {
        // decr the count
        await redis.decr(`${hashedId}:count`);
      }
    } else {
      await redis.set(`${hashedId}:count`, 40, "EX", 86400);
    }

    const verificaitonAttemptByIP = await redis.get(`${hashedId}:${userIp}`);

    console.log("verificaitonAttemptByIP", verificaitonAttemptByIP);

    if (verificaitonAttemptByIP !== null) {
      if (Number(verificaitonAttemptByIP) < 1) {
        return Response.json(
          {
            error: {
              code: "rate_limit",
              message: "Verification limit exceeded",
            },
          },
          { status: 429 }
        );
      } else {
        await redis.decr(`${hashedId}:${userIp}`);
      }
    } else {
      await redis.set(`${hashedId}:${userIp}`, 20, "EX", 86400);
    }

    const data: string | null = await redis.get(hashedId);

    if (!data) {
      return Response.json(
        {
          error: {
            code: "code_expired",
            message:
              "Verification code expired. Please generate a new verification code.",
          },
        },
        { status: 400 }
      );
    }

    const [otp, email] = data.split(":");

    if (otp !== code) {
      return Response.json(
        {
          error: {
            code: "invalid_code",
            message: "Please check your entered code",
          },
        },
        { status: 400 }
      );
    }

    // check if email is exist and verified

    const userExists = await db.query.user.findFirst({
      columns: { id: true, emailVerified: true },
      where: eq(user.email, email),
    });

    if (!userExists) {
      return Response.json(
        {
          error: {
            code: "code_expired",
            message:
              "Verification code expired. Please generate a new verification code.",
          },
        },
        { status: 400 }
      );
    }

    await db
      .update(user)
      .set({
        emailVerified: true,
      })
      .where(eq(user.email, email))
      .returning({ id: user.id });

    return Response.json({
      data: { emailVerified: true, message: "Email Verified" },
    });
  } catch (error) {
    console.log("error while verifying email", false);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
