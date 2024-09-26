import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { revalidate } from "@/app/layout";
import { db } from "@/db";
import { recoveryCodes, session } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt, aesEncrypt } from "@/lib/aes";

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return Response.json(
        { error: "authentication_error", message: "Log in" },
        { status: 401 }
      );
    }

    const decryptedAuthToken = aesDecrypt(
      authToken,
      EncryptionPurpose.SESSION_COOKIE
    );

    const sessionInfo = await db.query.session.findFirst({
      where: eq(session.id, decryptedAuthToken),
      columns: {},
      with: {
        user: {
          columns: {
            id: true,
            userName: true,
          },
        },
      },
    });

    if (!sessionInfo || !sessionInfo.user) {
      return Response.json(
        { error: "authorization_error", message: "Log in" },
        { status: 403 }
      );
    }

    const generateId = customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyz",
      4
    );

    const codes = Array.from(
      { length: 6 },
      () => `${generateId()}-${generateId()}-${generateId()}`
    );
    const encryptedCodes = codes.map((code) =>
      aesEncrypt(code, EncryptionPurpose.RECOVERY_CODE)
    );

    await db.transaction(async (trx) => {
      await trx
        .delete(recoveryCodes)
        .where(eq(recoveryCodes.userId, sessionInfo.user.id));
      await trx.insert(recoveryCodes).values(
        encryptedCodes.map((code) => ({
          userId: sessionInfo.user.id,
          code,
        }))
      );
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error: "server_error",
        message: "Internal server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
