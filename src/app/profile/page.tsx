import { getUserSessionRedis } from "@/db/queries/auth";
import { db } from "@/db";
import { loginLog, user } from "@/db/schema";
import { capitalizeFirstWord, formatDate, formatDateTime } from "@/lib/utils";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import RevokeAcess from "./_components/revoke-access";

export const metadata = {
  title: "Profile",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const userSession = await getUserSessionRedis();
  const sessionToken = cookies().get("auth-token")?.value;
  if (!userSession) {
    return redirect("/login");
  }
  const userInfo = await db.query.user.findFirst({
    where: eq(user.id, userSession.userId),
    columns: { email: true },
    with: {
      loginLog: {
        columns: {
          id: true,
          os: true,
          browser: true,
          device: true,
          loggedInAt: true,
          ip: true,
          sessionId: true,
        },
        orderBy: desc(loginLog.loggedInAt),
      },
      oauthToken: true,
    },
  });

  if (!userInfo) {
    return redirect("/login");
  }

  return (
    <div className="px-6">
      <h1 className="my-10 text-3xl font-bold text-center">Profile</h1>

      <div className="flex gap-5">
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

      {userInfo.oauthToken && userInfo.oauthToken.length > 0 && (
        <div className="my-5">
          <h2 className="text-xl my-3 font-semibold">Connected Accounts</h2>

          <div className="flex gap-5 flex-wrap items-center">
            {/* {userInfo?.user?.oauthTokens.map((provider) => (
                <div className="flex border-2 w-fit border-slate-600 items-center gap-4 rounded-full px-5 py-2">
                  {provider.strategy === "github" ? (
                    <img width="30px" src="/github-mark.svg" />
                  ) : (
                    <img width="30px" src="/google.svg" />
                  )}
                  {capitalizeFirstWord(provider.strategy)}
                </div>
              ))} */}

            {userInfo.oauthToken.map((provider) => (
              <div
                key={provider.id}
                className="flex border-2 w-fit border-slate-600 items-center gap-4 rounded-full px-5 py-2"
              >
                <FcGoogle className="w-8 h-8" /> Google
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="my-5">
        <h2 className="text-xl my-3 font-semibold">Log in logs</h2>

        <div className="flex flex-col gap-5">
          {userInfo.loginLog?.map((log) => (
            <div
              key={log.id}
              className="flex flex-col lg:flex-row justify-between items-center bg-slate-100 shadow-md rounded-md px-3 py-2"
            >
              <div className="flex text-center flex-wrap justify-center items-center gap-2">
                {sessionToken === log.sessionId && (
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
              <div className="flex md:gap-5 gap-3 w-full lg:w-auto mt-2 flex-col md:flex-row flex-wrap">
                <div>IP: {log.ip}</div>
                <div>Logged in at: {formatDateTime(log.loggedInAt!)}</div>
                {sessionToken !== log.sessionId && (
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

export default ProfilePage;
