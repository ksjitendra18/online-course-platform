import { db } from "@/db";
import { password as DbPassword, session, user } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import redis from "@/lib/redis";
import PasswordSchema from "@/validations/password";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { id, password }: { id: string; password: string } =
    await request.json();

  const parsedData = PasswordSchema.safeParse(password);

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

  if (!id) {
    return Response.json(
      {
        error: { code: "invalid_id", message: "Please pass a valid ID" },
      },
      { status: 400 }
    );
  }

  try {
    const userInfo: string | null = await redis.get(id);

    if (!userInfo) {
      return Response.json(
        {
          error: {
            code: "token_error",
            message: "Token expired. Please regenerate",
          },
        },
        { status: 400 }
      );
    }

    const userExists = await db.query.user.findFirst({
      where: and(eq(user.email, userInfo), eq(user.isBlocked, false)),
      columns: {
        id: true,
        email: true,
      },
    });

    if (!userExists) {
      return Response.json(
        {
          error: {
            code: "token_error",
            message: "Token expired. Please regenerate",
          },
        },
        { status: 400 }
      );
    }

    // const hashedPassword = await hash(parsedData.data, {
    //   memoryCost: 2 ** 16,
    //   timeCost: 5,
    //   parallelism: 2,
    // });
    const hashedPassword = await hashPassword({ password: parsedData.data });

    const res = await db
      .update(DbPassword)
      .set({
        password: hashedPassword,
      })
      .where(eq(DbPassword.userId, userExists.id));

    if (res.rowsAffected > 0) {
      await db.delete(session).where(eq(session.userId, userExists.id));

      return Response.json({ success: true }, { status: 200 });
    } else {
      return Response.json(
        { error: { code: "server_error", message: "Server Error" } },
        { status: 500 }
      );
    }
  } catch (err) {
    console.log("Error while reset password", err);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
