import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { loginLog, user } from "@/db/schema";
import { capitalizeFirstWord, formatDateTime } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import RevokeAcess from "./_components/revoke-access";
import { aesDecrypt, EncryptionPurpose } from "@/lib/aes";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Account",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const AccountPage = async () => {
  const userSession = await getUserSessionRedis();
  const sessionToken = cookies().get("auth-token")?.value;
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
  const logs = userInfo.loginLog.sort((a, b) =>
    a.sessionId === decryptedToken ? -1 : 1
  );

  const strategiesMap = {
    google: "Google",
    credentials: "Credential",
    magic_link: "Magic Link",
  };

  return (
    <div className="px-6">
      <h1 className="mt-10 mb-5  text-3xl font-bold text-center">Account</h1>

      <div className="flex gap-5 flex-wrap">
        <div className="border-2 border-sky-600 mt-5 flex items-center gap-3 w-fit rounded-full">
          <p className="bg-sky-600 rounded-l-full px-5 py-2 text-white">
            Email
          </p>
          <p className="px-5 py-2">{userInfo.email}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-5 flex-wrap">
          <div className="border-2 border-fuchsia-600 mt-5 flex items-center gap-3 w-fit rounded-full">
            <p className="bg-fuchsia-600 rounded-l-full px-5 py-2 text-white">
              Profile
            </p>
            <Link className="px-5 py-2" href="/profile/update">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {userInfo.twoFactorEnabled ? (
        <div className="flex gap-2 items-center">
          <div className="border-2 border-emerald-600 mt-5 flex items-center gap-3 w-fit rounded-full ">
            <p className="bg-emerald-600 rounded-l-full px-5 py-2 text-white">
              Multi factor Enabled
            </p>
            <Link className="px-5 py-2" href="/two-factor/totp">
              Re Configure
            </Link>
          </div>
          <div className="border-2 border-lime-600 mt-5 flex items-center gap-3 w-fit rounded-full ">
            <p className="bg-lime-600 rounded-l-full px-5 py-2 text-white">
              Recovery codes
            </p>
            <Link className="px-5 py-2" href="/recovery-codes">
              View
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-2 border-red-600 mt-5 flex items-center gap-3 w-fit rounded-full ">
          <p className="bg-red-600 rounded-l-full px-5 py-2 text-white">
            Two factor Disabled
          </p>
          <Link className="px-5 py-2" href="/two-factor/totp">
            Set up
          </Link>
        </div>
      )}

      {userInfo.oauthProvider && userInfo.oauthProvider.length > 0 && (
        <div className="my-5">
          <h2 className="text-xl my-3 font-semibold">Connected Accounts</h2>

          <div className="flex gap-5 flex-wrap items-center">
            {userInfo.oauthProvider.map((oauthProvider) => (
              <></>
            ))}
          </div>
        </div>
      )}

      <div className="my-5">
        <h2 className="text-2xl my-3 font-semibold">Log in logs</h2>

        <div className="flex flex-col gap-5">
          {userInfo.loginLog?.map((log) => (
            <div
              key={log.id}
              className="flex flex-col lg:flex-row justify-between items-center bg-slate-100 shadow-md rounded-md px-3 py-2"
            >
              <div className="flex text-center flex-wrap justify-center items-center gap-2">
                {decryptedToken === log.sessionId && (
                  <div className="bg-fuchsia-600 rounded-full text-white px-2 py-1 text-sm ">
                    This Device
                  </div>
                )}
                {capitalizeFirstWord(log.os)}
                &nbsp;
                {capitalizeFirstWord(log.device)}
                &nbsp;
                {capitalizeFirstWord(log.browser)}
              </div>
              <div className="flex items-center md:gap-5 gap-3 w-full lg:w-auto mt-2 flex-col md:flex-row flex-wrap">
                <div className="bg-blue-700 rounded-md px-2 py-1 text-white text-sm">
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
