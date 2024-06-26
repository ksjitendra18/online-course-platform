import { getUserSessionRedis } from "@/db/queries/auth";
import ChapterEditForm from "@/app/dashboard/components/chapter-edit-form";
import ChapterInformation from "@/app/dashboard/components/chapter-info-form";
import { db } from "@/db";
import { chapter, course, courseMember } from "@/db/schema";
import { cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const metadata = {
  title: "Edit Chapter",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const EditChapter = async ({
  params,
}: {
  params: { slug: string; moduleSlug: string; chapterSlug: string };
}) => {
  const userExists = await getUserSessionRedis();

  const courseExists = await db.query.course.findFirst({
    where: eq(course.slug, params.slug),
    columns: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!userExists || !courseExists) {
    return redirect("/");
  }

  const courseMemberInfo = await db.query.courseMember.findFirst({
    where: and(
      eq(courseMember.courseId, courseExists.id),
      eq(courseMember.userId, userExists.userId)
    ),
  });

  if (!courseMemberInfo) {
    return redirect("/dashboard");
  }

  const chapterInfo = await db.query.chapter.findFirst({
    where: and(
      eq(chapter.slug, params.chapterSlug),
      eq(chapter.courseId, courseExists.id)
    ),
    columns: {
      id: true,
      title: true,
      description: true,
      isFree: true,
      type: true,
      slug: true,
    },
    with: {
      courseModule: true,
      videoData: {
        columns: { playbackId: true, duration: true },
      },
      quiz: {
        with: {
          questions: {
            with: {
              answers: true,
            },
          },
        },
      },
    },
  });

  if (!chapterInfo) {
    return redirect(`/dashboard/courses/${params.slug}`);
  }

  return (
    <>
      <section className="px-6 py-3 w-full">
        <div className="flex items-center gap-2 my-5">
          <Link className="flex  ease-in items-center gap-3" href="/dashboard">
            <FaHome />
            Home &gt;
          </Link>

          <div>
            <Link href={`/dashboard/courses/${courseExists.slug}/basic`}>
              {courseExists.title} &gt;
            </Link>
          </div>

          <Link href={`/dashboard/courses/${courseExists.slug}/modules`}>
            Modules &gt;
          </Link>
          <div className="truncate">
            <Link
              href={`/dashboard/courses/${courseExists.slug}/modules/${chapterInfo.courseModule.slug}`}
            >
              {chapterInfo.courseModule.title} &gt;
            </Link>
          </div>
          <Link
            href={`/dashboard/courses/${courseExists.slug}/modules/${params.moduleSlug}`}
          >
            Chapters &gt;
          </Link>

          <Link
            href={`/dashboard/courses/${courseExists.slug}/modules/${params.moduleSlug}/chapters/${params.chapterSlug}`}
          >
            {chapterInfo.title} &gt;
          </Link>
          <Link
            className="border-b-2 border-black"
            href={`/dashboard/courses/${courseExists.slug}/modules/${params.moduleSlug}/chapters${params.chapterSlug}/edit`}
          >
            Edit Chapter
          </Link>
        </div>

        <div className="flex justify-between md:justify-start gap-x-3 items-center">
          <h1 className="text-2xl font-bold my-3">Edit Chapter</h1>
        </div>
        <ChapterEditForm
          moduleSlug={params.moduleSlug}
          courseSlug={courseExists.slug}
          moduleId={chapterInfo.courseModule.id}
          courseId={courseExists.id}
          isCourseFree={chapterInfo.isFree}
          chapterSlug={chapterInfo.slug}
          chapterName={chapterInfo.title}
          chapterId={chapterInfo.id}
          chapterDescription={chapterInfo.description!}
          isChapterFree={chapterInfo.isFree}
          type={chapterInfo.type}
          videoData={chapterInfo.videoData[0]}
        />
      </section>
    </>
  );
};

export default EditChapter;
