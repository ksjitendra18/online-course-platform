import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course } from "@/db/schema";
import { cn } from "@/lib/utils";

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
    <section className="w-full px-6 py-3">
      <div className="my-5 flex items-center gap-2">
        <Link className="flex items-center gap-3 ease-in" href="/dashboard">
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

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">
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
