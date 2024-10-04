import { redirect } from "next/navigation";
import React from "react";

import { getUserSessionRedis } from "@/db/queries/auth";

const AuthLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userSession = await getUserSessionRedis();

  if (userSession) {
    return redirect("/");
  }
  return <>{children}</>;
};

export default AuthLayout;
