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
    columns: {
      id: true,
      slug: true,
      title: true,
      description: true,
      isFree: true,
    },
  });

  if (!courseInfo) {
    return redirect("/");
  }
  return (
    <section className="px-6 py-3 w-full">
      <div className="flex items-center my-5 gap-2">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Home &gt;
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
