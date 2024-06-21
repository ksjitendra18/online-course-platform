import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Add New Modules",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const AddNewModules = async ({ params }: { params: { slug: string } }) => {
  const courseInfo = await db.query.course.findFirst({
    columns: {
      id: true,
      slug: true,
      title: true,
    },
    where: eq(course.slug, params.slug),
  });

  if (!courseInfo) {
    redirect("/dashboard");
  }
  return (
    <section className="px-6 py-3 w-full">
      <div className="flex items-center gap-2 my-5">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Home &gt;
        </Link>

        <Link href={`/dashboard/courses/${courseInfo.slug}/basic`}>
          {courseInfo.title} &gt;
        </Link>
        <Link
          className=""
          href={`/dashboard/courses/${courseInfo.slug}/modules`}
        >
          Modules &gt;
        </Link>
        <Link
          className="border-b-2 border-black"
          href={`/dashboard/courses/${courseInfo.slug}/modules/new`}
        >
          New Module
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
