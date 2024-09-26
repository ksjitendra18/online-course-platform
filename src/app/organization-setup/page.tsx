import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

import { getUserSessionRedis } from "@/db/queries/auth";

import OrganizationSetup from "../(auth)/_components/organization-setup";

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
      <h1 className="my-5 text-center text-3xl font-bold">
        Organization Setup
      </h1>
      <OrganizationSetup />
    </>
  );
};

export default OrganizationSetupPage;
