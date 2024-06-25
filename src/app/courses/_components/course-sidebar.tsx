"use client";
import { Purchase } from "@/db/schema";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, LockIcon, PlayCircleIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineQuiz } from "react-icons/md";
import { CourseData } from "../[courseSlug]/[...slug]/layout";
import CourseProgress from "./course-progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

const CourseSidebar = ({
  courseSlug,
  purchaseInfo,
  isPartOfCourse,
  courseData,
  chapterSlug,
  moduleSlug,
  userHasEnrolled,
  userId,
  progressCount,
  completedChapterIds,
}: {
  courseSlug: string;
  courseData: CourseData;
  purchaseInfo?: Purchase;
  isPartOfCourse: any;
  chapterSlug: string;
  moduleSlug: string;
  userHasEnrolled: boolean;
  progressCount: number;
  userId?: string;
  completedChapterIds: string[];
}) => {
  // sometimes in dev this is causing error
  // TypeError: Cannot read properties of null (reading 'useContext')

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pathname = usePathname();

  if (!isMounted) return null;
  return (
    <nav className="relative w-full max-w-sm flex-shrink-0  hidden lg:block">
      <div className="sticky top-0 h-auto">
        <ScrollArea className="relative overflow-hidden h-[calc(100vh-0rem)] pb-9 pt-2">
          <div className="mt-3 pt-5  bg-white mx-3 rounded-md">
            <Link href={`/courses/${courseData.slug}`}>
              <h1 className="text-center text-xl font-bold hover:underline">
                {courseData.title}
              </h1>
            </Link>
            <Link
              className={cn(
                pathname.includes("discussion") ? "bg-blue-600 text-white" : "",
                " flex items-center gap-2  justify-center text-center w-full mt-5 px-5 py-2 rounded-md "
              )}
              href={`/courses/${courseSlug}/discussions`}
            >
              Discussions Forum <ArrowRight />
            </Link>
          </div>

          {userHasEnrolled && (
            <div className="bg-white my-3 rounded-md px-3 mx-3 py-4">
              <h2 className="text-xl text-center mb-3 font-semibold">
                Progress
              </h2>
              <CourseProgress variant="success" value={progressCount} />
            </div>
          )}

          <div className="m-3">
            <Accordion type="single" collapsible defaultValue={moduleSlug}>
              {courseData.courseModule.map((module) => (
                <div key={module.id} className="pb-3">
                  <AccordionItem value={module.slug}>
                    <AccordionTrigger className="bg-white hover:no-underline px-4 py-1 rounded-tl-md rounded-tr-md border-b-2 no-underline">
                      <span className="px-3 font-semibold  text-center my-2">
                        {module.title}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="">
                      {module.chapter.map((chapter) => (
                        <Link
                          key={chapter.id}
                          className={cn(
                            chapter.slug === chapterSlug ? "" : " ",
                            " w-full "
                          )}
                          href={`/courses/${courseData.slug}/${module.slug}/${chapter.slug}`}
                        >
                          <span
                            className={cn(
                              chapter.slug === chapterSlug &&
                                " bg-blue-600 text-white rounded-md ",
                              "flex items-center gap-2 px-2 py-2"
                            )}
                          >
                            {chapter.isFree ||
                            courseData.isFree ||
                            purchaseInfo ||
                            isPartOfCourse ? (
                              <>
                                {chapter.type === "video" && <PlayCircleIcon />}
                                {chapter.type === "quiz" && (
                                  <MdOutlineQuiz size={20} />
                                )}
                                {chapter.type === "attachment" && (
                                  <PlayCircleIcon />
                                )}
                                {chapter.type === "article" && (
                                  <PlayCircleIcon />
                                )}
                              </>
                            ) : (
                              <LockIcon />
                            )}
                            {chapter.title}
                            {userHasEnrolled ? (
                              <>
                                {completedChapterIds.includes(chapter.id) ? (
                                  <Check
                                    className={cn(
                                      chapter.slug === chapterSlug
                                        ? "text-white"
                                        : "text-emerald-700 "
                                    )}
                                  />
                                ) : null}
                              </>
                            ) : null}
                          </span>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </nav>
  );
};

export default CourseSidebar;
