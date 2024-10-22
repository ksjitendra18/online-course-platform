import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import ChapterStatus from "@/app/dashboard/components/chapter-status";
import DeleteChapter from "@/app/dashboard/components/delete-chapter";
import { db } from "@/db";
import { chapter, course, courseModule } from "@/db/schema";
import { cn, formatDuration } from "@/lib/utils";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Module Chapters",
};

const ModuleSlugPage = async (
  props: {
    params: Promise<{ slug: string; moduleSlug: string }>;
  }
) => {
  const params = await props.params;
  const courseModuleWithChapters = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: {
      id: true,
      title: true,
      slug: true,
      isFree: true,
    },
    with: {
      courseModule: {
        where: eq(courseModule.slug, params.moduleSlug),
        columns: {
          id: true,
          slug: true,
          title: true,
        },
        with: {
          chapter: {
            orderBy: chapter.position,
            columns: {
              id: true,
              slug: true,
              isFree: true,
              title: true,
              position: true,
              status: true,
              modulePosition: true,
              type: true,
            },
            with: {
              videoData: {
                columns: {
                  duration: true,
                },
              },
              quiz: {
                columns: {
                  id: true,
                },
                with: {
                  questions: {
                    columns: { id: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!courseModuleWithChapters) {
    return redirect("/dashboard/courses");
  }

  if (courseModuleWithChapters.courseModule[0].chapter?.length < 1) {
    return redirect(
      `/dashboard/courses/${courseModuleWithChapters.slug}/modules/${params.moduleSlug}/new`
    );
  }
  return (
    <>
      <section className="w-full px-6 py-3">
        <div className="my-5 flex items-center gap-2">
          <Link className="flex items-center gap-3 ease-in" href="/dashboard">
            <FaHome />
            Home &gt;
          </Link>

          <div>{courseModuleWithChapters.title} &gt;</div>
          <Link
            href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules`}
          >
            Modules &gt;
          </Link>
          <div className="truncate">
            <Link
              href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}`}
            >
              {courseModuleWithChapters.courseModule[0].title} &gt;
            </Link>
          </div>
          <Link
            className="border-b-2 border-black"
            href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules/${params.moduleSlug}`}
          >
            Chapters
          </Link>
        </div>

        <div className="flex items-center justify-between gap-x-3 md:justify-start">
          <h1 className="my-3 text-2xl font-bold">
            {courseModuleWithChapters.courseModule[0].title} {"  "}Module
            Chapters
          </h1>

          <Link
            href={`/dashboard/courses/${courseModuleWithChapters?.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}/new`}
            className="rounded-md bg-blue-500 px-3 py-2 text-white"
          >
            Add New Chapter
          </Link>
        </div>

        <div className="mt-3 flex flex-col gap-y-3">
          {courseModuleWithChapters?.courseModule[0].chapter.map((chapter) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-2"
            >
              <div className="flex gap-3">
                <h3 className="font-semibold">
                  Chapter {chapter.modulePosition}: {chapter.title}
                </h3>
                <div
                  className={cn(
                    chapter.status === "published"
                      ? "bg-green-600"
                      : "bg-fuchsia-600",
                    "rounded-full px-2 py-1 text-sm text-white"
                  )}
                >
                  {chapter.status === "published" ? "Published" : "Unpublished"}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {!courseModuleWithChapters.isFree ? (
                    <>
                      {chapter.isFree ? (
                        <div className="rounded-md bg-green-500 px-3 py-1 text-white">
                          Free
                        </div>
                      ) : (
                        <div className="rounded-md bg-purple-600 px-3 py-1 text-white">
                          Paid
                        </div>
                      )}
                    </>
                  ) : null}

                  <div className="rounded-md bg-emerald-800 px-3 py-1 text-white">
                    {chapter.type}
                  </div>

                  {chapter.videoData.length > 0 && (
                    <div className="rounded-md bg-fuchsia-600 px-3 py-1 text-white">
                      {formatDuration(Math.ceil(chapter.videoData[0].duration))}
                    </div>
                  )}
                  {chapter.type === "quiz" &&
                    chapter.quiz[0]?.questions.length > 0 && (
                      <div className="rounded-md bg-fuchsia-600 px-3 py-1 text-white">
                        {chapter.quiz[0]?.questions.length} Questions
                      </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Link
                  href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}/chapters/${chapter.slug}`}
                >
                  View
                </Link>
                <Link
                  href={`/dashboard/courses/${courseModuleWithChapters.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}/chapters/${chapter.slug}/edit`}
                >
                  Edit
                </Link>
                {chapter.status !== "published" && (
                  <ChapterStatus
                    chapterId={chapter.id}
                    courseId={courseModuleWithChapters.id}
                    moduleId={courseModuleWithChapters.courseModule[0].id}
                    status={chapter.status}
                  />
                )}
                <DeleteChapter
                  chapterId={chapter.id}
                  courseId={courseModuleWithChapters.id}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default ModuleSlugPage;
