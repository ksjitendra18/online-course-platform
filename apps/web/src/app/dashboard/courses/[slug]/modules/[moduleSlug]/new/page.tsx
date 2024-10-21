import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import ChapterInformation from "@/app/dashboard/components/chapter-info-form";
import { db } from "@/db";
import { course, courseModule } from "@/db/schema";

export const metadata = {
  title: "Create new chapter",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const NewChapter = async (
  props: {
    params: Promise<{ slug: string; moduleSlug: string }>;
  }
) => {
  const params = await props.params;
  const courseModuleInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: { id: true, isFree: true, title: true, slug: true },
    with: {
      courseModule: {
        columns: { id: true, title: true, slug: true },
        where: eq(courseModule.slug, params.moduleSlug),
      },
    },
  });

  if (!courseModuleInfo) {
    return redirect("/dashboard/courses");
  }

  return (
    <>
      <section className="w-full px-6 py-3">
        <div className="my-5 flex items-center gap-2">
          <Link className="flex items-center gap-3 ease-in" href="/dashboard">
            <FaHome />
            Home &gt;
          </Link>

          <Link href={`/dashboard/courses/${courseModuleInfo.slug}/basic`}>
            {courseModuleInfo.title} &gt;
          </Link>
          <Link
            className=""
            href={`/dashboard/courses/${courseModuleInfo.slug}/modules`}
          >
            Modules &gt;
          </Link>
          <Link
            href={`/dashboard/courses/${courseModuleInfo.slug}/modules/${courseModuleInfo.courseModule[0].slug}`}
            className=""
          >
            {courseModuleInfo.courseModule[0].title} &gt;
          </Link>
          <p className="border-b-2 border-black">New Chapter</p>
        </div>

        <div className="flex items-center justify-between gap-x-3 md:justify-start">
          <h1 className="my-3 text-2xl font-bold">
            Add new Chapter for {courseModuleInfo.courseModule[0].title} Module
          </h1>
        </div>
        <ChapterInformation
          moduleSlug={params.moduleSlug}
          courseSlug={courseModuleInfo.slug}
          moduleId={courseModuleInfo.courseModule[0].id}
          courseId={courseModuleInfo.id}
          isCourseFree={courseModuleInfo.isFree}
          update={false}
        />
      </section>
    </>
  );
};

export default NewChapter;
