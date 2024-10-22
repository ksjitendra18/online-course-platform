import { cookies } from "next/headers";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { session } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt } from "@/lib/aes";
import redis from "@/lib/redis";

interface CurrentUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  staff: boolean;
}

type SessionExists = {
  id: string;
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
  const authToken = (await cookies()).get("auth-token")?.value;

  if (!authToken) {
    return null;
  }

  const decryptedAuthToken = aesDecrypt(
    authToken,
    EncryptionPurpose.SESSION_COOKIE
  );

  let cachedUserInfo = null;

  try {
    cachedUserInfo = await redis.get(decryptedAuthToken);
  } catch (error) {
    return null;
  }

  if (cachedUserInfo) {
    return JSON.parse(cachedUserInfo) as CurrentUser;
  } else {
    let sessionExists: SessionExists | undefined = undefined;
    try {
      sessionExists = await db.query.session.findFirst({
        where: eq(session.id, decryptedAuthToken),
        columns: { id: true },
        with: {
          user: {
            columns: { id: true, name: true, email: true, avatar: true },
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

    if (!sessionExists) {
      return null;
    }

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
      console.log("redis error");
    }

    return {
      userId: sessionExists.user.id,
      name: sessionExists.user.name,
      email: sessionExists.user.email,
      role:
        sessionExists.user.organizationMember.length > 0 ? "ADMIN" : "STUDENT",
      staff: sessionExists.user.organizationMember.length > 0,
    };
  }
}
