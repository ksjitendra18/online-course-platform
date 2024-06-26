import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course, courseModule } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Edit Module",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const EditModules = async ({
  params,
}: {
  params: { slug: string; moduleSlug: string };
}) => {
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: { id: true, slug: true, title: true },
    with: {
      courseModule: {
        columns: { id: true, slug: true, description: true, title: true },
        where: eq(courseModule.slug, params.moduleSlug),
      },
    },
  });

  if (!courseInfo) {
    redirect(`/courses/${params.slug}`);
  }
  return (
    <section className="px-6 py-3 w-full">
      <div className="flex items-center gap-2 my-5">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Home &gt;
        </Link>

        <Link href={`/dashboard/courses/${courseInfo.slug}`}>
          {courseInfo.title} &gt;
        </Link>
        <Link
          className=""
          href={`/dashboard/courses/${courseInfo.slug}/modules`}
        >
          Modules &gt;
        </Link>
        <Link
          href={`/dashboard/courses/${courseInfo.slug}/modules/${courseInfo.courseModule[0].slug}`}
          className=""
        >
          {courseInfo.courseModule[0].title} &gt;
        </Link>
        <Link
          href={`/dashboard/courses/${courseInfo.slug}/modules/${courseInfo.courseModule[0].slug}`}
          className="border-b-2 border-black"
        >
          Edit Module
        </Link>
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">Edit Module</h1>
      </div>
      <ModuleInformation
        moduleName={courseInfo.courseModule[0].title}
        moduleSlug={courseInfo.courseModule[0].slug}
        moduleDescription={courseInfo.courseModule[0].description!}
        courseSlug={courseInfo?.slug}
        courseId={courseInfo?.id}
        moduleId={courseInfo.courseModule[0].id}
        update={true}
      />
    </section>
  );
};

export default EditModules;
