import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import ModuleInformation from "@/app/dashboard/components/module-info-form";
import { db } from "@/db";
import { course, courseModule } from "@/db/schema";

export const metadata: Metadata = {
  title: "Edit Module",
};

const EditModules = async (props: {
  params: Promise<{ slug: string; moduleSlug: string }>;
}) => {
  const params = await props.params;
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
    <section className="w-full px-6 py-3">
      <div className="my-5 flex items-center gap-2">
        <Link className="flex items-center gap-3 ease-in" href="/dashboard">
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

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">Edit Module</h1>
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
