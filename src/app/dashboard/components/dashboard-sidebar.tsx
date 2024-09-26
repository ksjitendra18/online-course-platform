"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { IoMdAnalytics } from "react-icons/io";
import { MdCategory, MdDashboard, MdLibraryBooks } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";

import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const pathName = usePathname();
  return (
    <div className="relative hidden min-h-[calc(100vh-5rem)] w-full max-w-60 flex-shrink-0 border-r-2 lg:block">
      <div className="sticky top-0 my-5 h-auto px-3">
        <div className="flex flex-col items-center gap-3">
          <Link
            className={cn(
              pathName === "/dashboard"
                ? "bg-blue-500/20 font-semibold text-blue-500"
                : "text-slate-700 hover:bg-gray-200 hover:text-black",
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
            )}
            href="/dashboard"
          >
            <MdDashboard />
            Dashboard
          </Link>
          <Link
            className={cn(
              pathName.includes("courses")
                ? "bg-blue-500/20 font-semibold text-blue-500"
                : "text-slate-700 hover:bg-gray-200 hover:text-black",
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
            )}
            href="/dashboard/courses"
          >
            <MdLibraryBooks />
            Courses
          </Link>

          <Link
            className={cn(
              pathName === "/dashboard/analytics"
                ? "bg-blue-500/20 font-semibold text-blue-500"
                : "text-slate-700 hover:bg-gray-200 hover:text-black",
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
            )}
            href="/dashboard/analytics"
          >
            <IoMdAnalytics />
            Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
