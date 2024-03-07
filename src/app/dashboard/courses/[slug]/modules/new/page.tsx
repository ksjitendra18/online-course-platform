import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const metadata: Metadata = {
  title: "Add New Modules",
};

const AddNewModules = async ({ params }: { params: { slug: string } }) => {
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
  });

  if (!courseInfo) {
    redirect("/dashboard");
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
          href={`/dashboard/courses/${courseInfo?.slug}/modules`}
        >
          Step 2: Course Modules
        </Link>
        <Link
          className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
          href="#"
        >
          Step 3: Other Information
        </Link>
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">
          Add new {courseInfo?.title} Module
        </h1>
      </div>
      <ModuleInformation
        courseSlug={courseInfo?.slug}
        courseId={courseInfo?.id}
        update={false}
      />
    </section>
  );
};

export default AddNewModules;
