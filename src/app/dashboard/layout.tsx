import React from "react";
import DashboardSidebar from "./components/dashboard-sidebar";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getUserSessionRedis();

  if (!user) {
    return redirect("/login");
  }

  if (!user.staff) {
    return redirect("/");
  }
  return (
    <div>
      <main className="flex h-full">
        <DashboardSidebar />
        <div className="pl-56 h-full w-full">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
