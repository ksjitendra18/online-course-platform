"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

const DashboardSidebar = () => {
  const pathName = usePathname();
  return (
    <div className="w-56 h-full fixed top-[80px] border-r-2 border-slate-200">
      <div className="flex flex-col items-center">
        {/* <a
          className={cn(
            pathName === "/dashboard"
              ? "text-sky-700 bg-sky-400/20"
              : "text-slate-500 hover:bg-slate-300/20 hover:text-slate-600",
            "p-6 w-full font-medium "
          )}
          href="/dashboard"
        >
          Dashboard
        </a> */}
        <a
          className={cn(
            pathName.includes("courses")
              ? "text-sky-700 bg-sky-400/20"
              : "text-slate-500 hover:bg-slate-300/20 hover:text-slate-600",
            "p-6 w-full font-medium "
          )}
          href="/dashboard/courses"
        >
          Courses
        </a>
        <a
          className={cn(
            pathName === "/dashboard/analytics"
              ? "text-sky-700 bg-sky-400/20"
              : "text-slate-500 hover:bg-slate-300/20 hover:text-slate-600",
            "p-6 w-full font-medium "
          )}
          href="/dashboard"
        >
          Analytics
        </a>
      </div>
    </div>
  );
};

export default DashboardSidebar;
