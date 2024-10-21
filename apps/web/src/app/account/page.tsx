import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { desc, eq } from "drizzle-orm";
import { FaGoogle } from "react-icons/fa6";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { loginLog, user } from "@/db/schema";
import { EncryptionPurpose, aesDecrypt } from "@/lib/aes";
import { capitalizeFirstWord, formatDateTime } from "@/lib/utils";

import RevokeAcess from "./_components/revoke-access";
import RevokeAllSessions from "./_components/revoke-all-sessions";

export const metadata = {
  title: "Account",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const AccountPage = async () => {
  const userSession = await getUserSessionRedis();
  const sessionToken = (await cookies()).get("auth-token")?.value;
  if (!userSession || !sessionToken) {
    return redirect("/login");
  }
  const userInfo = await db.query.user.findFirst({
    where: eq(user.id, userSession.userId),
    columns: { email: true, twoFactorEnabled: true },
    with: {
      loginLog: {
        columns: {
          id: true,
          os: true,
          browser: true,
          device: true,
          createdAt: true,
          ip: true,
          sessionId: true,
          strategy: true,
        },
        limit: 10,
        orderBy: desc(loginLog.createdAt),
      },
      oauthProvider: true,
    },
  });

  if (!userInfo) {
    return redirect("/login");
  }

  const decryptedToken = aesDecrypt(
    sessionToken,
    EncryptionPurpose.SESSION_COOKIE
  );

  const strategiesMap = {
    google: "Google",
    credentials: "Credential",
    magic_link: "Magic Link",
  };

  return (
    <div className="px-6">
      <h1 className="mb-5 mt-10 text-center text-3xl font-bold">Account</h1>

      <div className="flex flex-wrap gap-5">
        <div className="mt-5 flex w-fit items-center gap-3 rounded-full border-2 border-sky-600">
          <p className="rounded-l-full bg-sky-600 px-5 py-2 text-white">
            Email
          </p>
          <p className="px-5 py-2">{userInfo.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-5">
          <div className="mt-5 flex w-fit items-center gap-3 rounded-full border-2 border-fuchsia-600">
            <p className="rounded-l-full bg-fuchsia-600 px-5 py-2 text-white">
              Profile
            </p>
            <Link className="px-5 py-2" href="/account/update">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {userInfo.twoFactorEnabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="mt-5 flex w-fit items-center gap-3 rounded-full border-2 border-emerald-600">
            <p className="rounded-l-full bg-emerald-600 px-5 py-2 text-white">
              Multi factor Enabled
            </p>
            <Link className="px-5 py-2" href="/two-factor/totp">
              Re Configure
            </Link>
          </div>
          <div className="mt-5 flex w-fit items-center gap-3 rounded-full border-2 border-lime-600">
            <p className="rounded-l-full bg-lime-600 px-5 py-2 text-white">
              Recovery codes
            </p>
            <Link className="px-5 py-2" href="/recovery-codes">
              View
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex w-fit items-center gap-3 rounded-full border-2 border-red-600">
          <p className="rounded-l-full bg-red-600 px-5 py-2 text-white">
            Two factor Disabled
          </p>
          <Link className="px-5 py-2" href="/two-factor/totp">
            Set up
          </Link>
        </div>
      )}

      {userInfo.oauthProvider && userInfo.oauthProvider.length > 0 && (
        <div className="my-5">
          <h2 className="my-3 text-xl font-semibold">Connected Accounts</h2>

          <div className="flex flex-wrap items-center gap-5">
            {userInfo.oauthProvider.map((oauthProvider) => (
              <div
                key={oauthProvider.id}
                className="flex items-center gap-2 rounded-full border-2 px-4 py-2"
              >
                <FaGoogle />
                {strategiesMap[oauthProvider.provider]}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="my-5 mt-10">
        <div className="flex items-center gap-3">
          <h2 className="my-3 text-2xl font-semibold">Log in logs</h2>

          <RevokeAllSessions />
        </div>

        <div className="flex flex-col gap-5">
          {userInfo.loginLog?.map((log) => (
            <div
              key={log.id}
              className="flex flex-col items-center justify-between rounded-md bg-slate-100 px-3 py-2 shadow-md lg:flex-row"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 text-center">
                {decryptedToken === log.sessionId && (
                  <div className="rounded-full bg-fuchsia-600 px-2 py-1 text-sm text-white">
                    This Device
                  </div>
                )}
                {capitalizeFirstWord(log.os)}
                &nbsp;
                {capitalizeFirstWord(log.device)}
                &nbsp;
                {capitalizeFirstWord(log.browser)}
              </div>
              <div className="mt-2 flex w-full flex-col flex-wrap items-center gap-3 md:flex-row md:gap-5 lg:w-auto">
                <div className="rounded-md bg-blue-700 px-2 py-1 text-sm text-white">
                  Method: {strategiesMap[log.strategy]}
                </div>

                <div>IP: {log.ip}</div>
                <div>Logged in at: {formatDateTime(log.createdAt * 1000)}</div>
                {decryptedToken !== log.sessionId && (
                  <RevokeAcess id={log.sessionId!} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
