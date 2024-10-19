"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FormInput } from "lucide-react";
import { BsInfoCircle, BsQuestionSquare } from "react-icons/bs";
import { FaTag } from "react-icons/fa";
import { FaGear, FaUsers } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { RiFolderVideoFill, RiQuestionAnswerLine } from "react-icons/ri";

import { cn } from "@/lib/utils";

import PublishCourse from "./publish-course";

const CourseDashboardSidebar = ({
  slug,
  title,
  status,
  courseId,
}: {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived" | "deleted";
  courseId: string;
}) => {
  const pathName = usePathname();
  return (
    <div className="relative hidden min-h-[calc(100vh-5rem)] w-full max-w-60 flex-shrink-0 border-r-2 lg:block">
      <h1 className="mt-5 truncate border-b-2 p-3 pb-2 text-center font-semibold">
        <Link href={`/courses/${slug}`}>{title}</Link>
      </h1>

      <div className="flex flex-col items-center gap-3 px-5 py-2">
        {status === "published" ? (
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-700 px-3 py-1 text-sm uppercase text-white">
              Published
            </div>
          </div>
        ) : (
          <>
            <PublishCourse
              triggerMsg="Publish"
              courseId={courseId}
              variant={"app"}
            />
          </>
        )}
        <Link
          className={cn(
            pathName === "/dashboard"
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={"/dashboard"}
        >
          <MdDashboard />
          Dashboard
        </Link>
        <Link
          className={cn(
            pathName === `/dashboard/courses/${slug}/basic`
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/basic`}
        >
          <FormInput />
          Basic
        </Link>
        <Link
          className={cn(
            pathName.includes("modules")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/modules`}
        >
          <RiFolderVideoFill />
          Course Content
        </Link>
        <Link
          className={cn(
            pathName.includes("other")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/other`}
        >
          <BsInfoCircle />
          Other Info
        </Link>
        {true && (
          <Link
            className={cn(
              pathName.includes("discounts")
                ? "bg-blue-500/20 font-semibold text-blue-500"
                : "text-slate-700 hover:bg-gray-200 hover:text-black",
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
            )}
            href={`/dashboard/courses/${slug}/discounts`}
          >
            <FaTag />
            Discounts
          </Link>
        )}
        <Link
          className={cn(
            pathName.includes("enrollments")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/enrollments`}
        >
          <FaUsers />
          Enrollments
        </Link>
        <Link
          className={cn(
            pathName.includes("quiz-responses")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/quiz-responses`}
        >
          <BsQuestionSquare />
          Quiz Response
        </Link>
        <Link
          className={cn(
            pathName.includes("discussions")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/discussions`}
        >
          <RiQuestionAnswerLine />
          Discussions
        </Link>
        <Link
          className={cn(
            pathName.includes("members")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/members`}
        >
          <FaUsers />
          Members
        </Link>
        <Link
          className={cn(
            pathName.includes("settings")
              ? "bg-blue-500/20 font-semibold text-blue-500"
              : "text-slate-700 hover:bg-gray-200 hover:text-black",
            "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-all duration-100 ease-in"
          )}
          href={`/dashboard/courses/${slug}/settings`}
        >
          <FaGear />
          Settings
        </Link>
      </div>
    </div>
  );
};

export default CourseDashboardSidebar;
