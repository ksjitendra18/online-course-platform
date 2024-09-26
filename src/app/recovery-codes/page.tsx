import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { recoveryCodes, user } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt, aesEncrypt } from "@/lib/aes";

import RotateRecoveryCode from "./_components/rotate-recovery-code";

const RecoveryCodes = async () => {
  const userExists = await getUserSessionRedis();

  if (!userExists) {
    return redirect("/login");
  }
  const userRecoveryCodes = await db.query.user.findFirst({
    where: eq(user.id, userExists.userId),
    with: {
      recoveryCodes: {
        where: eq(recoveryCodes.isUsed, false),
        columns: {
          code: true,
        },
      },
    },
  });

  if (!userRecoveryCodes) {
    return redirect("/login");
  }

  return (
    <div>
      <h1 className="my-10 text-center text-3xl font-bold">Recovery Code</h1>

      {userRecoveryCodes.recoveryCodes.length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <p className="mb-3 mt-5 text-center">
            Enable Two Factor Auth to Set up Recovery Codes
          </p>

          <a
            href="/account"
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Go to Account Page
          </a>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-xl flex-col">
        <div className="flex items-center gap-3">
          <h3 className="my-5 text-xl font-bold">Exisiting Codes</h3>
          <Button variant="app" asChild>
            <Link href="/api/auth/recovery-codes/download">Download Codes</Link>
          </Button>
          <RotateRecoveryCode />
        </div>
        {userRecoveryCodes.recoveryCodes.map((code) => (
          <p key={code.code}>
            {aesDecrypt(code.code, EncryptionPurpose.RECOVERY_CODE)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default RecoveryCodes;
