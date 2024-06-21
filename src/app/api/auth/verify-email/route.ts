import { db } from "@/db";
import { user } from "@/db/schema";
import redis from "@/lib/redis";
import { xxh64 } from "@node-rs/xxhash";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { id, code } = await request.json();
  try {
    const hashedId = xxh64(id).toString(16);
    const data: string | null = await redis.get(hashedId);

    // const data: string | null = await redis.get(id);

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
