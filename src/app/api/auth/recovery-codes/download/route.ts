import { cookies } from "next/headers";

import { and, eq, gte } from "drizzle-orm";

import { db } from "@/db";
import { recoveryCodes, session } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt } from "@/lib/aes";

export async function GET() {
  try {
    const authToken = cookies().get("auth-token")?.value;

    if (!authToken) {
      return Response.json(
        { error: "authentication_error", message: "Log in" },
        {
          status: 401,
        }
      );
    }

    const decryptedAuthToken = aesDecrypt(
      authToken,
      EncryptionPurpose.SESSION_COOKIE
    );

    const sessionInfo = await db.query.session.findFirst({
      where: and(
        eq(session.id, decryptedAuthToken),
        gte(session.expiresAt, new Date().getTime())
      ),
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
        {
          status: 403,
        }
      );
    }

    const exisitingCode = await db.query.recoveryCodes.findMany({
      where: and(
        eq(recoveryCodes.userId, sessionInfo.user.id),
        eq(recoveryCodes.isUsed, false)
      ),
    });

    if (exisitingCode.length < 1) {
      return Response.json(
        {
          error: "not_found",
          message: "No codes exists for the user.",
        },
        { status: 404 }
      );
    }

    const codes: string[] = [];

    if (exisitingCode.length > 0) {
      exisitingCode.forEach((code) => {
        codes.push(aesDecrypt(code.code, EncryptionPurpose.RECOVERY_CODE));
      });
    }

    return new Response(codes.join("\n"), {
      headers: {
        "Content-Disposition": `attachment; filename=${sessionInfo.user.userName}-recovery-codes-learning-app.txt`,
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.log("error while downloading", error);
    return Response.json(
      {
        error: "server_error",
        message: "Error while downloading code",
      },
      { status: 500 }
    );
  }
}
