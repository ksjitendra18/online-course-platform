import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { recoveryCodes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import TwoFactorForm from "../../(auth)/_components/two-factor-form";

const TotpSetup = async () => {
  const currentUser = await getUserSessionRedis();

  if (!currentUser) {
    return redirect("/");
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, currentUser.userId),
    columns: { id: true, email: true, twoFactorEnabled: true },
  });

  if (!existingUser) {
    return redirect("/login");
  }

  const secret = authenticator.generateSecret(20);

  const otpAuthUrl = authenticator.keyuri(
    existingUser.email,
    "Learning App",
    secret
  );

  const imageUrl = await qrcode.toDataURL(otpAuthUrl);
  return (
    <div className="px-4">
      <h1 className="my-10 text-3xl font-bold text-center">Two Factor Setup</h1>

      {existingUser.twoFactorEnabled && (
        <div className="flex items-center justify-center">
          <p className="bg-emerald-700 text-white rounded-md px-2 py-1">
            You have Two Factor enabled. You can reconfigure it by submitting
            the form.
          </p>
        </div>
      )}

      <TwoFactorForm qrCode={imageUrl} secretCode={secret} />
    </div>
  );
};

export default TotpSetup;
