"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRight, Check, LockIcon, PlayCircleIcon } from "lucide-react";
import { MdOutlineQuiz } from "react-icons/md";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Purchase } from "@/db/schema";
import { cn } from "@/lib/utils";

import { CourseData } from "../[courseSlug]/[...slug]/layout";
import CourseProgress from "./course-progress";

const CourseSidebar = ({
  courseSlug,
  purchaseInfo,
  isPartOfCourse,
  courseData,
  chapterSlug,
  moduleSlug,
  isEnrolled,
  progressCount,
  completedChapterIds,
}: {
  courseSlug: string;
  courseData: CourseData;
  purchaseInfo?: Partial<Purchase>;
  isPartOfCourse: boolean;
  chapterSlug: string;
  moduleSlug: string;
  isEnrolled: boolean;
  progressCount: number;
  userId?: string;
  completedChapterIds: string[];
}) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pathname = usePathname();

  if (!isMounted) return null;
  return (
    <nav className="relative w-full max-w-sm flex-shrink-0 lg:block">
      <div className="sticky top-0 h-auto">
        <ScrollArea className="relative h-[calc(100vh-0rem)] overflow-hidden pb-9 pt-2">
          <div className="mx-3 mt-3 rounded-md border-2 bg-white pt-5">
            <Link href={`/courses/${courseData.slug}`}>
              <h1 className="text-center text-xl font-bold hover:underline">
                {courseData.title}
              </h1>
            </Link>
            <Link
              className={cn(
                pathname.includes("discussion") ? "bg-blue-600 text-white" : "",
                "mt-5 flex w-full items-center justify-center gap-2 rounded-md px-5 py-2 text-center"
              )}
              href={`/courses/${courseSlug}/discussions`}
            >
              Discussions Forum <ArrowRight />
            </Link>
          </div>

          {isEnrolled && (
            <div className="mx-3 my-3 rounded-md bg-white px-3 py-4">
              <h2 className="mb-3 text-center text-xl font-semibold">
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
                    <AccordionTrigger className="rounded-tl-md rounded-tr-md border-2 border-b-2 bg-white px-4 py-1 no-underline hover:no-underline">
                      <span className="my-2 px-3 text-center font-semibold">
                        {module.title}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="">
                      {module.chapter.map((chapter) => (
                        <Link
                          key={chapter.id}
                          className={cn(
                            chapter.slug === chapterSlug ? "" : " ",
                            "w-full"
                          )}
                          href={`/courses/${courseData.slug}/${module.slug}/${chapter.slug}`}
                        >
                          <span
                            className={cn(
                              chapter.slug === chapterSlug &&
                                "rounded-md bg-blue-600 text-white",
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
                            {isEnrolled ? (
                              <>
                                {completedChapterIds.includes(chapter.id) ? (
                                  <Check
                                    className={cn(
                                      chapter.slug === chapterSlug
                                        ? "text-white"
                                        : "text-emerald-700"
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
