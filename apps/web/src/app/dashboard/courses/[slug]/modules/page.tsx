import Link from "next/link";
import { redirect } from "next/navigation";

import { eq, inArray } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import DeleteModule from "@/app/dashboard/components/delete-module";
import ModuleStatus from "@/app/dashboard/components/module-status";
import { db } from "@/db";
import { chapter, course, courseModule } from "@/db/schema";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Modules",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const ModulesPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const courseInfo = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: {
      id: true,
      slug: true,
      title: true,
    },

    with: {
      courseModule: {
        columns: {
          id: true,
          title: true,
          slug: true,
          position: true,
          status: true,
        },
        orderBy: courseModule.position,
      },
    },
  });

  // const moduleIds = courseInfo.courseModule.map((module) => module.id);

  const publishableModules = await db
    .select({ id: courseModule.id })
    .from(courseModule)
    .where(
      inArray(
        courseModule.id,
        db
          .select({ moduleId: chapter.moduleId })
          .from(chapter)
          .where(eq(chapter.status, "published"))
      )
    );

  if (!courseInfo) {
    redirect("/dashboard");
  }
  if (courseInfo && courseInfo?.courseModule?.length < 1) {
    redirect(`/dashboard/courses/${courseInfo?.slug}/modules/new`);
  }

  return (
    <section className="w-full px-6 py-3">
      <div className="my-5 flex items-center gap-2">
        <Link className="flex items-center gap-3 ease-in" href="/dashboard">
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
          href={`/dashboard/courses/${courseInfo.slug}/modules`}
        >
          Modules
        </Link>
      </div>

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">{courseInfo?.title} Modules</h1>

        <Link
          href={`/dashboard/courses/${courseInfo?.slug}/modules/new`}
          className="rounded-md bg-blue-500 px-3 py-2 text-white"
        >
          Add New Module
        </Link>
      </div>

      <div className="mt-3 flex flex-col gap-y-3">
        {courseInfo?.courseModule.map((courseModule) => (
          <div
            key={courseModule.id}
            className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-2"
          >
            <div className="flex items-center gap-x-3">
              Module {courseModule.position}: {courseModule.title}
              <div
                className={cn(
                  courseModule.status === "published"
                    ? "bg-green-600"
                    : "bg-fuchsia-600",
                  "rounded-full px-2 py-1 text-sm text-white"
                )}
              >
                {courseModule.status === "published"
                  ? "Published"
                  : "Unpublished"}
              </div>
            </div>
            <div className="flex items-center gap-x-5">
              <Link
                href={`/dashboard/courses/${courseInfo.slug}/modules/${courseModule.slug}`}
              >
                View Chapters
              </Link>
              <Link
                href={`/dashboard/courses/${courseInfo.slug}/modules/${courseModule.slug}/edit`}
              >
                Edit
              </Link>
              {courseModule.status !== "published" &&
                publishableModules.some(
                  (module) => module.id === courseModule.id
                ) && (
                  <ModuleStatus
                    status={courseModule.status}
                    courseId={courseInfo.id}
                    moduleId={courseModule.id}
                  />
                )}

              <DeleteModule
                courseId={courseInfo.id}
                moduleId={courseModule.id}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ModulesPage;
