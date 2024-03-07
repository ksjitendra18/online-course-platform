import { db } from "@/db";
import { course, courseModule } from "@/db/schema";
import { cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const ModuleSlugPage = async ({
  params,
}: {
  params: { slug: string; moduleSlug: string };
}) => {
  // const courseModuleWithChapters = await db.query.courseModule.findFirst({
  //   where: eq(courseModule.slug, params.moduleSlug),
  //   with: {
  //     course: {
  //       where: eq(course.slug, params.slug),
  //       columns: {
  //         id: true,
  //         title: true,
  //         slug: true,
  //       },
  //     },

  //     chapter: true,
  //   },
  // });
  const courseModuleWithChapters = await db.query.course.findFirst({
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

  console.log("courseModuleWithChapters", courseModuleWithChapters);

  if (!courseModuleWithChapters) {
    return redirect("/dashboard/courses");
  }

  if (courseModuleWithChapters.courseModule[0].chapter?.length < 1) {
    return redirect(
      `/dashboard/courses/${courseModuleWithChapters.slug}/modules/${params.moduleSlug}/new`
    );
  }
  return (
    <>
      <section className="px-6 py-3 w-full">
        <div className="flex my-5 gap-1 items-center justify-between">
          <Link
            className={cn(
              "flex-1 py-3 rounded-l-md bg-green-500 text-white w-full flex items-center justify-center"
            )}
            href={`/dashboard/courses/${courseModuleWithChapters.slug}/basic`}
          >
            Step 1: Basic Information
          </Link>
          <Link
            className="flex-1 py-3 bg-blue-500 text-white w-full flex items-center justify-center"
            href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules`}
          >
            Step 2: Course Modules
          </Link>
          <Link
            className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
            href={`/dashboard/courses/${courseModuleWithChapters.slug}/other`}
          >
            Step 3: Other Information
          </Link>
        </div>

        <div className="flex justify-between md:justify-start gap-x-3 items-center">
          <h1 className="text-2xl font-bold my-3">
            {courseModuleWithChapters.title} - {courseModuleWithChapters.title}{" "}
            Module Chapters
          </h1>

          <a
            href={`/dashboard/courses/${courseModuleWithChapters?.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}/new`}
            className="bg-blue-500 text-white rounded-md px-3 py-2"
          >
            Add New Chapter
          </a>
        </div>

        <div className="flex flex-col gap-y-3 mt-3">
          {courseModuleWithChapters?.courseModule[0].chapter.map((chapter) => (
            <div
              key={chapter.id}
              className="px-3 py-2 flex bg-slate-100  items-center justify-between rounded-md"
            >
              <div className="flex gap-3">
                <h3 className="font-semibold ">
                  Chapter {chapter.position}: {chapter.title}
                </h3>
                <div className="text-sm">
                  {chapter.isFree ? (
                    <div className="bg-green-500 px-3 rounded-md text-white py-1">
                      Free
                    </div>
                  ) : (
                    <div className="bg-purple-600 px-3 rounded-md text-white py-1">
                      Paid
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <p>View</p>
                <p>Edit</p>
                <p>Delete</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default ModuleSlugPage;
