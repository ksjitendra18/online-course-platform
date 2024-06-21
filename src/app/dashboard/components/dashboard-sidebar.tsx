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
    // <div className="lg:w-72 hidden lg:block h-full fixed top-[80px] border-r-2 border-slate-200">
    <div className="lg:w-72 h-full px-5 py-5 top-[80px] border-r-2 border-slate-200">
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
            pathName.includes("categories")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href="/dashboard/categories"
        >
          <MdCategory />
          Categories
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
  );
};

export default DashboardSidebar;
