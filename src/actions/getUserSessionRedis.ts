import { eq } from "drizzle-orm";
import { db } from "@/db";
import { session } from "@/db/schema";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import redis from "@/lib/redis";

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  staff: boolean;
}
export async function getUserSessionRedis() {
  const authToken = cookies().get("auth-token")?.value;

  if (!authToken) {
    return null;
  }

  let cachedUserInfo = null;

  try {
    cachedUserInfo = await redis.get(authToken);
    console.log("cached", cachedUserInfo);
  } catch (error) {}

  console.log("cachedUser", cachedUserInfo);
  if (cachedUserInfo) {
    // return cachedUserInfo as CurrentUser;
    return JSON.parse(cachedUserInfo) as CurrentUser;
  }

  if (!cachedUserInfo) {
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

    if (!sessionExists) return null;
    if (!sessionExists.active) return null;

    try {
      await redis.set(
        authToken,
        JSON.stringify({
          userId: sessionExists.user.id,
          name: sessionExists.user.name,
          email: sessionExists.user.email,
          staff: sessionExists.user.organizationMember.length > 0,
        }),

        "EX",
        3600
      );
      // await redis.set(
      //   authToken,
      //   JSON.stringify({
      //     userId: sessionExists.user.id,
      //     name: sessionExists.user.name,
      //     email: sessionExists.user.email,
      //     staff: sessionExists.user.organizationMember.length > 0,
      //   }),
      //   {
      //     ex: 3600,
      //   }
      // );
    } catch (error) {
    } finally {
      return {
        userId: sessionExists.user.id,
        name: sessionExists.user.name,
        email: sessionExists.user.email,
        role:
          sessionExists.user.organizationMember.length > 0
            ? "ADMIN"
            : "STUDENT",
        staff: sessionExists.user.organizationMember.length > 0,
      };
    }
  }
}
