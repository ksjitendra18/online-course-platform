import { db } from "@/db";
import { session } from "@/db/schema";
import { decryptCookie } from "@/lib/cookies";
import redis from "@/lib/redis";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  staff: boolean;
}

type SessionExists = {
  id: string;
  active: boolean | null;
  user: {
    id: string;
    name: string;
    email: string;
    organizationMember: {
      role: "owner" | "admin" | "teacher" | "auditor";
    }[];
  };
};

export async function getUserSessionRedis() {
  const authToken = cookies().get("auth-token")?.value;

  if (!authToken) {
    return null;
  }

  // EXPERIMENTAL
  const decryptedAuthToken = await decryptCookie(authToken);

  let cachedUserInfo = null;

  try {
    cachedUserInfo = await redis.get(decryptedAuthToken);
  } catch (error) {}

  if (cachedUserInfo) {
    return JSON.parse(cachedUserInfo) as CurrentUser;
  }

  if (!cachedUserInfo) {
    let sessionExists: SessionExists | undefined = undefined;
    try {
      sessionExists = await db.query.session.findFirst({
        where: eq(session.id, decryptedAuthToken),
        columns: { id: true, active: true },
        with: {
          user: {
            columns: { id: true, name: true, email: true },
            with: {
              organizationMember: {
                columns: { role: true },
              },
            },
          },
        },
      });
    } catch (error) {
      return null;
    }

    if (!sessionExists) return null;
    if (!sessionExists.active) return null;

    try {
      await redis.set(
        decryptedAuthToken,
        JSON.stringify({
          userId: sessionExists.user.id,
          name: sessionExists.user.name,
          email: sessionExists.user.email,
          staff: sessionExists.user.organizationMember.length > 0,
        }),

        "EX",
        3600
      );
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
