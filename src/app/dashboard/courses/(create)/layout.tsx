import React from "react";
import DashboardSidebar from "../../components/dashboard-sidebar";
import { getUserSessionRedis } from "@/db/queries/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUserSessionRedis();

  if (!user) {
    return redirect("/login");
  }

  if (!user.staff) {
    return redirect("/");
  }
  return (
    <div className="flex h-full">
      <DashboardSidebar />
      <div className=" h-full w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
