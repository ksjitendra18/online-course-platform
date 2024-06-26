"use client";
import { cn } from "@/lib/utils";
import { FormInput } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsInfoCircle, BsQuestionSquare } from "react-icons/bs";
import { FaGear, FaUsers } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { RiFolderVideoFill, RiQuestionAnswerLine } from "react-icons/ri";

const CourseSidebar = ({
  slug,
  title,
  isPublished,
}: {
  slug: string;
  title: string;
  isPublished: boolean;
}) => {
  const pathName = usePathname();
  return (
    <div className="hidden lg:block relative w-full max-w-60 min-h-[calc(100vh-5rem)] border-r-2  flex-shrink-0">
      <h1 className="mt-5 text-center p-3  border-b-2 pb-2 truncate font-semibold">
        <Link href={`/courses/${slug}`}>{title}</Link>
      </h1>

      <div className="flex gap-3 flex-col px-5 py-2 items-center">
        {isPublished ? (
          <div className="rounded-full my-3 text-white bg-blue-500 px-6 py-1 text-sm">
            PUBLISHED
          </div>
        ) : (
          <div className="rounded-full my-3 bg-gray-200 px-6 py-1 text-sm">
            DRAFT
          </div>
        )}
        <Link
          className={cn(
            pathName === "/dashboard"
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard`}
        >
          <MdDashboard />
          Dashboard
        </Link>
        <Link
          className={cn(
            pathName === `/dashboard/courses/${slug}/basic`
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/basic`}
        >
          <FormInput />
          Basic
        </Link>
        <Link
          className={cn(
            pathName.includes("modules")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/modules`}
        >
          <RiFolderVideoFill />
          Course Content
        </Link>
        <Link
          className={cn(
            pathName.includes("other")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/other`}
        >
          <BsInfoCircle />
          Other Info
        </Link>
        <Link
          className={cn(
            pathName.includes("enrollments")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/enrollments`}
        >
          <FaUsers />
          Enrollments
        </Link>
        <Link
          className={cn(
            pathName.includes("quiz-responses")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/quiz-responses`}
        >
          <BsQuestionSquare />
          Quiz Response
        </Link>
        <Link
          className={cn(
            pathName.includes("discussions")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
          )}
          href={`/dashboard/courses/${slug}/discussions`}
        >
          <RiQuestionAnswerLine />
          Discussions
        </Link>
        <Link
          className={cn(
            pathName.includes("settings")
              ? "bg-blue-500/20 text-blue-500 font-semibold"
              : "text-slate-700 hover:text-black hover:bg-gray-200",
            "px-2 flex items-center  gap-2 py-2 w-full rounded-md transition-all duration-100 ease-in cursor-pointer "
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

export default CourseSidebar;
