import { db } from "@/db";
import { session } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EncryptJWT, base64url, jwtDecrypt } from "jose";
import { cookies } from "next/headers";

import { NextRequest } from "next/server";

const secret = base64url.decode(process.env.JWT_SECRET!);

export async function GET(request: NextRequest) {
  console.log(
    "called",
    cookies().get("true"),
    cookies().get("test-auth-token")
  );
  const currentUserToken = cookies().get("current_user")?.value;

  if (currentUserToken) {
    try {
      const { payload } = await jwtDecrypt(currentUserToken, secret);

      return Response.json({ currentUser: payload });
    } catch (error) {
      console.log("DB called");
      const authToken = cookies().get("auth-token")?.value;
      if (!authToken) {
        return new Response(null, { status: 204 });
      }
      const sessionExists = await db.query.session.findFirst({
        where: eq(session.id, authToken),
        with: {
          user: {
            with: {
              organizationMember: true,
            },
          },
        },
      });

      if (!sessionExists) {
        return new Response(null, { status: 204 });
      }
      if (!sessionExists.active) {
        return new Response(null, { status: 204 });
      }

      const userInfo = {
        userId: sessionExists.user.id,
        name: sessionExists.user.name,
        email: sessionExists.user.email,
        role:
          sessionExists.user.organizationMember.length > 0
            ? "ADMIN"
            : "STUDENT",
        staff: sessionExists.user.organizationMember.length > 0,
      };

      console.log("user", userInfo);
      const jwt = await new EncryptJWT(userInfo)
        .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .encrypt(secret);

      cookies().set("current_user", jwt, {
        expires: 3600,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return Response.json({
        currentUser: userInfo,
      });
    }
  } else {
    const authToken = cookies().get("auth-token")?.value;
    console.log("DB called in else", authToken, cookies().get("auth-token"));

    if (!authToken) {
      return new Response(null, { status: 204 });
    }
    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, authToken),
      with: {
        user: {
          with: {
            organizationMember: true,
          },
        },
      },
    });

    console.log(sessionExists);

    if (!sessionExists) {
      return new Response(null, { status: 204 });
    }
    if (!sessionExists.active) {
      return new Response(null, { status: 204 });
    }

    const userInfo = {
      userId: sessionExists.user.id,
      name: sessionExists.user.name,
      email: sessionExists.user.email,
      role:
        sessionExists.user.organizationMember.length > 0 ? "ADMIN" : "STUDENT",
      staff: sessionExists.user.organizationMember.length > 0,
    };

    console.log("user", userInfo);
    const jwt = await new EncryptJWT(userInfo)
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .encrypt(secret);

    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + 1 * 60 * 60 * 1000);
    cookies().set("current_user", jwt, {
      expires: expiresAt.getTime(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return Response.json({
      currentUser: userInfo,
    });
  }
}
