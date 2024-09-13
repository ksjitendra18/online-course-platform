import { getUserSessionRedis } from "@/db/queries/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import ProfileForm from "../_components/profile-form";

export const metadata = {
  title: "Update Profile",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const UpdateProfile = async () => {
  const userSession = await getUserSessionRedis();
  const sessionToken = cookies().get("auth-token")?.value;
  if (!userSession) {
    return redirect("/login");
  }
  const userInfo = await db.query.user.findFirst({
    columns: { name: true, email: true, userName: true },
    where: eq(user.id, userSession.userId),
  });

  if (!userInfo) {
    return redirect("/login");
  }
  return (
    <>
      <div className="flex mt-14 items-center justify-center flex-col">
        <h1 className="text-3xl font-bold mb-5">Update Profile</h1>

        <ProfileForm
          email={userInfo.email}
          name={userInfo.name}
          userName={userInfo.userName}
        />
      </div>
    </>
  );
};

export default UpdateProfile;
