import { cookies } from "next/headers";

import { and, eq, not } from "drizzle-orm";

import { db } from "@/db";
import { session } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt } from "@/lib/aes";
import { checkAuth } from "@/lib/auth";

export async function POST() {
  try {
    const { isAuth, userInfo } = await checkAuth();
    const currentSession = (await cookies()).get("auth-token")?.value;
    if (!isAuth || !userInfo || !currentSession) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const decryptedSessionToken = aesDecrypt(
      currentSession,
      EncryptionPurpose.SESSION_COOKIE
    );

    await db
      .delete(session)
      .where(
        and(
          eq(session.userId, userInfo.id),
          not(eq(session.id, decryptedSessionToken))
        )
      );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error while updating profile", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
