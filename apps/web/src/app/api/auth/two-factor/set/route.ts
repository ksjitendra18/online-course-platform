import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { and, eq, gte } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import { authenticator } from "otplib";

import { db } from "@/db";
import { recoveryCodes, session, user } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt, aesEncrypt } from "@/lib/aes";

export async function POST(request: NextRequest) {
  const generateId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 4);
  const currentTime = new Date().getTime(); // Cache current time to avoid repetitive calls

  try {
    const { secretCode, enteredCode } = await request.json();

    if (
      !secretCode ||
      !enteredCode ||
      enteredCode.length !== 6 ||
      secretCode.length !== 32
    ) {
      return Response.json({ error: "validation_error" }, { status: 400 });
    }

    const authToken = (await cookies()).get("auth-token")?.value;

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
      where: and(
        eq(session.id, decryptedAuthToken),
        gte(session.expiresAt, currentTime)
      ),
      with: {
        user: true,
      },
    });

    console.log("decryptedAuthToken", decryptedAuthToken, sessionInfo);
    if (!sessionInfo || !sessionInfo.user) {
      return Response.json(
        { error: "authorization_error", message: "Log in" },
        { status: 403 }
      );
    }

    const isValidToken = authenticator.verify({
      token: enteredCode,
      secret: secretCode,
    });

    const userId = sessionInfo.user.id;

    if (!isValidToken) {
      return Response.json(
        {
          error: "verification_error",
          message:
            "Error while verifying two-factor code. Enter a new code and try again. If the error persists, remove the account from the app and refresh this page.",
        },
        { status: 400 }
      );
    }

    // Batch update user info and recovery codes
    const encryptedSecretCode = aesEncrypt(
      secretCode,
      EncryptionPurpose.TWO_FA_SECRET
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
        .update(user)
        .set({
          twoFactorEnabled: true,
          twoFactorSecret: encryptedSecretCode,
        })
        .where(eq(user.id, userId));

      await trx.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
      await trx.insert(recoveryCodes).values(
        encryptedCodes.map((code) => ({
          userId,
          code,
        }))
      );
    });

    return Response.json({
      success: true,
      data: {
        codes,
      },
    });
  } catch (err) {
    console.log("Error while verifying two-factor authentication", err);
    return Response.json(
      {
        error: {
          code: "server_error",
          message: "Internal server error. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
