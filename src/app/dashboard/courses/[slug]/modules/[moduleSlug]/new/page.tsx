import ChapterInformation from "@/app/dashboard/components/chapter-info-form";
import { db } from "@/db";
import { course, courseModule } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Create new chapter",
};
const NewChapter = async ({
  params,
}: {
  params: { slug: string; moduleSlug: string };
}) => {
  // const courseModuleInfo = await db.query.courseModule.findFirst({
  //   where: eq(courseModule.slug, params.moduleSlug),
  //   with: {
  //     course: {
  //       columns: {
  //         slug: true,
  //         id: true,
  //         isFree: true,
  //       },
  //     },
  //   },
  // });

  const courseModuleInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    with: {
      courseModule: {
        where: eq(courseModule.slug, params.moduleSlug),
        with: {
          chapter: true,
        },
      },
    },
  });

  console.log("courseModuleInfo", courseModuleInfo);

  if (!courseModuleInfo) {
    return redirect("/dashboard/courses");
  }

  if (courseModuleInfo) {
    if (courseModuleInfo.courseModule.length < 1) {
      return redirect("/dashboard/courses");
    }
  }

  return (
    <>
      <section className="px-6 py-3 w-full">
        <div className="flex my-5 gap-1 items-center justify-between">
          <Link
            className={cn(
              "flex-1 py-3 rounded-l-md bg-green-500 text-white w-full flex items-center justify-center"
            )}
            href={`/dashboard/courses/${courseModuleInfo.slug}/basic`}
          >
            Step 1: Basic Information
          </Link>
          <Link
            className="flex-1 py-3 bg-blue-500 text-white w-full flex items-center justify-center"
            href={`/dashboard/courses/${courseModuleInfo.slug}/modules`}
          >
            Step 2: Course Modules
          </Link>
          <Link
            className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
            href={`/dashboard/courses/${courseModuleInfo.slug}/others`}
          >
            Step 3: Other Information
          </Link>
        </div>

        <div className="flex justify-between md:justify-start gap-x-3 items-center">
          <h1 className="text-2xl font-bold my-3">
            Add new Chapter for {courseModuleInfo.title} Module
          </h1>
        </div>
        <ChapterInformation
          moduleSlug={params.moduleSlug}
          courseSlug={courseModuleInfo.slug}
          moduleId={courseModuleInfo.courseModule[0].id}
          courseId={courseModuleInfo.id}
          isCourseFree={courseModuleInfo.isFree}
          update={false}
        />
      </section>
    </>
  );
};

export default NewChapter;
