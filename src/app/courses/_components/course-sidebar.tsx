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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { LockIcon, PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseData } from "../[courseSlug]/[chapterId]/layout";

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
  chapterId?: string;
}) => {
  return (
    <div className="lg:w-80 lg:h-full lg:fixed lg:top-[80px] ">
      <h1 className="text-center text-xl font-bold mt-5 py-5  bg-white mx-3 rounded-md">
        {courseData.title}
      </h1>

      <div className="m-3">
        <Accordion type="single" collapsible>
          {courseData.courseModule.map((module) => (
            <div key={module.id} className="pb-3">
              <AccordionItem value={module.id}>
                <AccordionTrigger className="bg-white hover:no-underline px-4 py-1 rounded-tl-md rounded-tr-md border-b-2 no-underline">
                  <span className="px-3 font-semibold  text-center my-2">
                    {module.title}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="px-4 py-1 bg-white">
                  {module.chapter.map((chapter) => (
                    <Link
                      key={chapter.id}
                      className={cn(
                        chapter.slug === chapterId ? "" : " ",
                        " px-1 w-full "
                      )}
                      href={`/courses/${courseData.slug}/${module.slug}/${chapter.slug}`}
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
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CourseSidebar;
