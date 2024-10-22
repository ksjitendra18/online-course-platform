import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course } from "@/db/schema";

export const metadata: Metadata = {
  title: "Add New Modules",
};

const AddNewModules = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
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
