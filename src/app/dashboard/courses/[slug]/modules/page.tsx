import { db } from "@/db";
import { course, courseModule } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Modules",
};
const ModulesPage = async ({ params }: { params: { slug: string } }) => {
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    with: {
      courseModule: {
        orderBy: courseModule.position,
      },
    },
  });

  if (courseInfo && courseInfo?.courseModule?.length < 1) {
    redirect(`/dashboard/courses/${courseInfo?.slug}/modules/new`);
  }

  return (
    <section className="px-6 py-3 w-full">
      <div className="flex my-5 gap-1 items-center justify-between">
        <Link
          className={cn(
            "flex-1 py-3 rounded-l-md bg-green-500 text-white w-full flex items-center justify-center"
          )}
          href={`/dashboard/courses/${courseInfo?.slug}/basic`}
        >
          Step 1: Basic Information
        </Link>
        <Link
          className="flex-1 py-3 bg-blue-500 text-white w-full flex items-center justify-center"
          href="#"
        >
          Step 2: Course Modules
        </Link>
        <Link
          className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
          href={`/dashboard/courses/${courseInfo?.slug}/other`}
        >
          Step 3: Other Information
        </Link>
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">{courseInfo?.title} Modules</h1>

        <Link
          href={`/dashboard/courses/${courseInfo?.slug}/modules/new`}
          className="bg-blue-500 text-white rounded-md px-3 py-2"
        >
          Add New Module
        </Link>
      </div>

      <div className="flex flex-col gap-y-3 mt-3">
        {courseInfo?.courseModule.map((courseModule) => (
          <div
            key={courseModule.id}
            className="px-3 py-2 flex bg-slate-100  items-center justify-between rounded-md"
          >
            <div className=" ">
              Module {courseModule.position}: {courseModule.title}
            </div>
            <div className="flex gap-x-5">
              <Link
                href={`/dashboard/courses/${courseInfo.slug}/modules/${courseModule.slug}`}
              >
                View Chapters
              </Link>
              <Link
                href={`/dashboard/courses/${courseInfo.slug}/modules/1/chapters`}
              >
                Edit
              </Link>
              <Link
                href={`/dashboard/courses/${courseInfo.slug}/modules/1/chapters`}
              >
                Delete
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ModulesPage;
