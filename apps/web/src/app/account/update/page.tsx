import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { user } from "@/db/schema";

import ProfileForm from "../_components/profile-form";

export const metadata = {
  title: "Update Profile",
};

const UpdateProfile = async () => {
  const userSession = await getUserSessionRedis();
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
      <div className="mt-14 flex flex-col items-center justify-center">
        <h1 className="mb-5 text-3xl font-bold">Update Profile</h1>

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
