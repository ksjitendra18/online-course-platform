import { getUserSessionRedis } from "@/db/queries/auth";
import VideoPlayer from "@/app/courses/_components/video-player";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { chapter, course, courseMember } from "@/db/schema";
import { capitalizeFirstWord, cn } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const metadata = {
  title: "View Chapter",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const ViewChapter = async ({
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

  console.log("params", params.chapterSlug, courseExists.id);

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
      courseModule: {
        columns: {
          title: true,
          slug: true,
        },
      },
      videoData: true,
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
    <section className="px-6 py-3 w-full">
      <div className="flex items-center gap-2 my-5">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Home &gt;
        </Link>

        <div>{courseExists.title} &gt;</div>
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
          className="border-b-2 border-black"
          href={`/dashboard/courses/${courseExists.slug}/modules/${params.moduleSlug}/${params.chapterSlug}`}
        >
          {chapterInfo.title}
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center my-3">View Chapter</h1>
      <div className=" w-full px-6 flex flex-col items-center justify-center">
        <div className="w-[100%] mx-auto md:w-3/4 lg:w-1/2">
          <label htmlFor="chapterName" className=" mt-5 block text-gray-600">
            Chapter Name
          </label>
          <input
            type="text"
            name="chapterName"
            readOnly
            value={chapterInfo.title}
            id="chapterName"
            placeholder="Name of the chapter"
            className=" px-3 border-slate-400 w-full  py-2 rounded-md border-2"
          />

          <label htmlFor="chapterSlug" className=" mt-5 block text-gray-600">
            Chapter Slug
          </label>
          <input
            type="text"
            name="chapterSlug"
            id="chapterSlug"
            defaultValue={chapterInfo.slug}
            placeholder="Slug of the chapter"
            className="border-slate-400 px-3 w-full  py-2 rounded-md border-2"
          />

          <label
            htmlFor="chapterDescription"
            className=" mt-5 block text-gray-600"
          >
            Chapter Description
          </label>
          <textarea
            name="chapterDescription"
            id="chapterDescription"
            value={chapterInfo.description!}
            placeholder="Description of the chapter (under 300 words)"
            className=" px-3 w-full border-slate-400  py-2 rounded-md border-2"
          />

          <label className=" mt-5 inline-flex text-gray-600">
            This will be:
          </label>

          <div className="text-white w-fit mt-2 bg-blue-500 cursor-pointer  rounded-md px-3 py-1">
            {chapterInfo.isFree ? "Free Chapter" : "Paid Chapter"}
          </div>

          <label className=" mt-5 inline-flex text-gray-600">
            Chapter Type:
          </label>
          <div className="flex mt-2 items-center gap-4 ">
            <div className="text-white bg-blue-500 cursor-pointer  rounded-md px-3 py-1">
              {capitalizeFirstWord(chapterInfo.type)}
            </div>
          </div>

          {chapterInfo.type === "video" ? (
            <>
              <div className="flex my-5  items-center justify-center mx-auto ">
                <VideoPlayer
                  autoPlay={false}
                  playbackId={chapterInfo.videoData[0].playbackId!}
                />
              </div>
            </>
          ) : null}

          {chapterInfo.type === "quiz" && (
            <>
              {chapterInfo.quiz[0]?.questions ? (
                <>
                  <h3 className="text-xl my-3 font-bold">
                    {" "}
                    {chapterInfo.quiz[0].questions.length} Questions
                  </h3>
                  <div className="flex flex-col gap-5">
                    {chapterInfo.quiz[0].questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="flex flex-col shadow-md bg-white rounded-md px-5 py-3"
                      >
                        <h3 className="font-semibold">
                          Q{index + 1}. {question.questionText}
                        </h3>

                        <div>
                          <p className="my-3">Answer Choices</p>

                          <div className="grid grid-cols-2 grid-rows-2">
                            {question.answers.map((answer) => (
                              <div
                                className="flex items-center gap-3"
                                key={answer.id}
                              >
                                {answer.isCorrect ? (
                                  <Check className="text-green-600" />
                                ) : (
                                  <X className="text-red-600" />
                                )}
                                {answer.answerText}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <></>
              )}
            </>
          )}

          <Button asChild variant="app" className="my-5 w-full">
            <Link
              href={`/dashboard/courses/${params.slug}/modules/${params.moduleSlug}/chapters/${params.chapterSlug}/edit`}
            >
              Edit Chapter
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ViewChapter;
