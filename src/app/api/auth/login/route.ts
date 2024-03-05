import crypto from "node:crypto";
import Bowser from "bowser";

import { db } from "@/db";
import { device, session, user } from "@/db/schema";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import LoginSchema from "@/validations/login";

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
          error: "validation_error",
          message: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    const userExists = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!userExists) {
      return Response.json(
        {
          error: "auth_error",
          message: "Please check email and password",
        },
        { status: 400 }
      );
    }

    const validPassword = await bcrypt.compare(
      parsedData.data.password,
      userExists.password
    );

    if (!validPassword) {
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        {
          status: 400,
        }
      );
    }

    const parser = Bowser.getParser(
      request.headers.get("user-agent") as string
    );

    const userIp = request.headers.get("x-real-ip") ?? "dev";

    const deviceId = createId();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const newSession = await db
      .insert(session)
      .values({
        deviceId,
        expiresAt: BigInt(expiresAt.getTime()),
        userIp,
        userId: userExists.id,
      })
      .returning({ id: session.id });

    const deviceFingerPrint = crypto
      .createHash("sha256")
      .update(request.headers.get("user-agent") as string)
      .digest("hex");

    await db.insert(device).values({
      id: deviceId,
      userId: userExists.id,
      sessionId: newSession[0].id,
      browser: `${parser.getBrowser().name}`,
      deviceFingerPrint,
      userIp,
      os: `${parser.getOS().name} ${parser.getOS().version}`,
      lastActive: new Date().getTime(),
      loggedIn: true,
    });

    let cookie = `auth-token=${
      newSession[0].id
    };Expires=${expiresAt.toUTCString()};Path=/; HttpOnly=${true}; SameSite=Lax`;

    if (process.env.NODE_ENV === "production") {
      cookie = `auth-token=${
        newSession[0].id
      };Expires=${expiresAt.toUTCString()};Path=/; HttpOnly=${true}; Secure=${true}; SameSite=Lax`;
    }

    return Response.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": cookie,
        },

        status: 200,
      }
    );
  } catch (error) {
    console.log(`error LOGIN`, error);
    return Response.json({ success: false }, { status: 500 });
  }
}
