import { getUserSessionRedis } from "@/db/queries/auth";
import { redirect } from "next/navigation";
import React from "react";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const userSession = await getUserSessionRedis();

  if (userSession) {
    return redirect("/");
  }
  return <>{children}</>;
};

export default AuthLayout;
