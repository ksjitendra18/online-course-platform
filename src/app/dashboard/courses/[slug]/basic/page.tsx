import BasicInformation from "@/app/dashboard/components/basic-info-form";
import { db } from "@/db";
import { course } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Basic Info",
};

const BasicPage = async ({ params }: { params: { slug: string } }) => {
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
  });

  if (!courseInfo) {
    return redirect("/");
  }
  return (
    <section className="px-6 py-3 w-full">
      {/* <div className="flex my-5 gap-1 items-center justify-between">
        <Link
          className={cn(
            "flex-1 py-3 rounded-l-md bg-blue-500 text-white w-full flex items-center justify-center"
          )}
          href={`#`}
        >
          Step 1: Basic Information
        </Link>
        <Link
          className="flex-1 py-3 bg-slate-300 w-full flex items-center justify-center"
          href={`/dashboard/courses/${courseInfo?.slug}/modules`}
        >
          Step 2: Course Modules
        </Link>
        <Link
          className="flex-1 py-3 rounded-r-md bg-slate-300 w-full flex items-center justify-center"
          href={`/dashboard/courses/${courseInfo?.slug}/other`}
        >
          Step 3: Other Information
        </Link>
      </div> */}

      <div className="flex items-center my-5 gap-2">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Homes &gt;
        </Link>
        <div>
          <Link href={`/dashboard/courses/${courseInfo.slug}/basic`}>
            {courseInfo.title} &gt;
          </Link>
        </div>{" "}
        <Link
          className="border-b-2 border-black"
          href={`/dashboard/courses/${courseInfo.slug}/basic`}
        >
          Basic Info
        </Link>
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">Edit Course Details</h1>
      </div>
      <BasicInformation
        courseSlug={courseInfo?.slug}
        courseId={courseInfo?.id}
        courseName={courseInfo.title}
        courseDescription={courseInfo.description}
        isFree={courseInfo.isFree}
        update={true}
      />
    </section>
  );
};

export default BasicPage;
