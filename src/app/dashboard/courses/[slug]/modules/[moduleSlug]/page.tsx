import DeleteChapter from "@/app/dashboard/components/delete-chapter";
import { db } from "@/db";
import { chapter, course, courseModule } from "@/db/schema";
import { cn, formatDuration } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Module Chapters",
};

const ModuleSlugPage = async ({
  params,
}: {
  params: { slug: string; moduleSlug: string };
}) => {
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
    return redirect(`/dashboard/courses`);
  }

  if (courseModuleWithChapters.courseModule[0].chapter?.length < 1) {
    return redirect(
      `/dashboard/courses/${courseModuleWithChapters.slug}/modules/${params.moduleSlug}/new`
    );
  }
  return (
    <>
      <section className="px-6 py-3 w-full">
        <div className="flex items-center gap-2 my-5">
          <Link className="flex  ease-in items-center gap-3" href="/dashboard">
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

        <div className="flex justify-between md:justify-start gap-x-3 items-center">
          <h1 className="text-2xl font-bold my-3">
            {courseModuleWithChapters.courseModule[0].title} {"  "}Module
            Chapters
          </h1>

          <Link
            href={`/dashboard/courses/${courseModuleWithChapters?.slug}/modules/${courseModuleWithChapters.courseModule[0].slug}/new`}
            className="bg-blue-500 text-white rounded-md px-3 py-2"
          >
            Add New Chapter
          </Link>
        </div>

        <div className="flex flex-col gap-y-3 mt-3">
          {courseModuleWithChapters?.courseModule[0].chapter.map((chapter) => (
            <div
              key={chapter.id}
              className="px-3 py-2 flex bg-slate-100  items-center justify-between rounded-md"
            >
              <div className="flex gap-3">
                <h3 className="font-semibold ">
                  Chapter {chapter.modulePosition}: {chapter.title}
                </h3>
                <div className="text-sm flex items-center gap-4">
                  {!courseModuleWithChapters.isFree ? (
                    <>
                      {chapter.isFree ? (
                        <div className="bg-green-500 px-3 rounded-md text-white py-1">
                          Free
                        </div>
                      ) : (
                        <div className="bg-purple-600 px-3 rounded-md text-white py-1">
                          Paid
                        </div>
                      )}
                    </>
                  ) : null}

                  <div className="bg-emerald-800 px-3 rounded-md text-white py-1">
                    {chapter.type}
                  </div>

                  {chapter.videoData.length > 0 && (
                    <div className="bg-fuchsia-600 px-3 rounded-md text-white py-1">
                      {formatDuration(Math.ceil(chapter.videoData[0].duration))}
                    </div>
                  )}
                  {chapter.type === "quiz" &&
                    chapter.quiz[0]?.questions.length > 0 && (
                      <div className="bg-fuchsia-600 px-3 rounded-md text-white py-1">
                        {chapter.quiz[0]?.questions.length} Questions
                      </div>
                    )}
                </div>
              </div>
              <div className="flex gap-5 items-center">
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
