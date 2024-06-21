import React from "react";
import OrganizationSetup from "../(auth)/_components/organization-setup";
import { getUserSessionRedis } from "@/db/queries/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Organization Setup",
};

const OrganizationSetupPage = async () => {
  const currentUser = await getUserSessionRedis();

  // const signupType = cookies().get("signup_type")?.value;

  if (!currentUser) {
    return redirect("/login");
  }

  // if (!signupType) {
  //   return redirect("/dashboard");
  // }
  return (
    <>
      <h1 className="text-3xl my-5 font-bold text-center">
        Organization Setup
      </h1>
      <OrganizationSetup />
    </>
  );
};

export default OrganizationSetupPage;
