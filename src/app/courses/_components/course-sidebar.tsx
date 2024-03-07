import getUserSession from "@/actions/getUserSession";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import {
  Purchase,
  chapter,
  course,
  courseModule,
  purchase,
  user,
} from "@/db/schema";
import { cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { LockIcon, PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseData } from "../[courseSlug]/layout";

const CourseSidebar = async ({
  courseSlug,
  purchaseInfo,
  isPartOfCourse,
  courseData,
  chapterId,
}: {
  courseSlug: string;
  courseData: CourseData;
  purchaseInfo?: Purchase;
  isPartOfCourse: any;
  chapterId: string;
}) => {
  return (
    <div className="w-64 h-full fixed top-[80px] border-r-2 border-slate-200">
      <h1 className="text-center text-xl font-bold mt-5 pb-5 border-b-2 border-slate-300">
        {courseData.title}
      </h1>

      <div className="">
        {courseData.courseModule.map((module) => (
          <div key={module.id} className="border-b-2 pb-3">
            <h3 className="px-3 font-semibold text-center my-2">
              {module.title}
            </h3>
            <div className="flex gap-1 flex-col">
              {module.chapter.map((chapter) => (
                <Link
                  key={chapter.id}
                  className={cn(
                    chapter.id === chapterId
                      ? "text-white bg-blue-500"
                      : "hover:bg-slate-200 ",
                    "py-3 px-2 w-full "
                  )}
                  href={`/courses/${courseData.slug}/${chapter.id}`}
                >
                  <span className="flex items-center gap-2">
                    {chapter.isFree ||
                    courseData.isFree ||
                    purchaseInfo ||
                    isPartOfCourse ? (
                      <PlayCircleIcon />
                    ) : (
                      <LockIcon />
                    )}
                    {chapter.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSidebar;
