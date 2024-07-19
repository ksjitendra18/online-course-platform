"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { MdCategory, MdDashboard, MdLibraryBooks } from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";
import { RxDashboard } from "react-icons/rx";

const DashboardSidebar = () => {
  const pathName = usePathname();
  return (
    <div className="relative w-full max-w-60 min-h-[calc(100vh-5rem)] border-r-2  flex-shrink-0  hidden lg:block">
      <div className="sticky top-0 h-auto px-3 my-5">
        <div className="flex gap-3 flex-col items-center">
          <Link
            className={cn(
              pathName === "/dashboard"
                ? "bg-blue-500/20 text-blue-500 font-semibold"
                : "text-slate-700 hover:text-black hover:bg-gray-200",
              "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
            )}
            href="/dashboard"
          >
            <MdDashboard />
            Dashboard
          </Link>
          <Link
            className={cn(
              pathName.includes("courses")
                ? "bg-blue-500/20 text-blue-500 font-semibold"
                : "text-slate-700 hover:text-black hover:bg-gray-200",
              "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
            )}
            href="/dashboard/courses"
          >
            <MdLibraryBooks />
            Courses
          </Link>

          <Link
            className={cn(
              pathName === "/dashboard/analytics"
                ? "bg-blue-500/20 text-blue-500 font-semibold"
                : "text-slate-700 hover:text-black hover:bg-gray-200",
              "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
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
