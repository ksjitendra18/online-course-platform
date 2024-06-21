import React from "react";
import BuyCourse from "../../_components/buy-course";
import VideoPlayer from "../../_components/video-player";

import { getUserSessionRedis } from "@/db/queries/auth";
import { db } from "@/db";
import {
  CourseEnrollment,
  Purchase,
  chapter,
  course,
  courseEnrollment,
  courseModule,
  purchase,
  quiz,
  quizResponse,
} from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, X } from "lucide-react";
import ChapterQuiz from "../../_components/chapter-quiz";
import { Button } from "@/components/ui/button";
import QuizDuration from "../../_components/quiz-duration";
import { formatDate } from "@/lib/utils";
import VideoPlayerWithProgress from "../../_components/video-player-progress";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const ChapterPage = async ({
  params,
}: {
  params: { courseSlug: string; slug: string[] };
}) => {
  const courseData = await db.query.course.findFirst({
    where: eq(course.slug, params.courseSlug),
    columns: {
      id: true,
      title: true,
      isFree: true,
      slug: true,
      imageUrl: true,
      description: true,
      price: true,
    },
    with: {
      courseMember: true,
      courseModule: {
        where: eq(courseModule.slug, params.slug[0]),
        columns: {
          title: true,
          id: true,
        },
        orderBy: courseModule.position,
        with: {
          chapter: {
            where: eq(chapter.slug, params.slug[1]),
            columns: {
              id: true,
              title: true,
              isFree: true,
            },
            orderBy: chapter.position,
          },
        },
      },
    },
  });

  const userSession = await getUserSessionRedis();

  if (
    !courseData ||
    !courseData.courseModule ||
    courseData.courseModule.length < 1 ||
    courseData.courseModule[0].chapter.length < 1
  ) {
    return redirect("/");
  }

  let purchaseInfo: Purchase | undefined;
  let isPartOfCourse;
  let isEnrolled: CourseEnrollment | undefined;

  if (userSession) {
    purchaseInfo = await db.query.purchase.findFirst({
      where: and(
        eq(purchase.courseId, courseData.id),
        eq(purchase.userId, userSession.userId)
      ),
    });

    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );

    isEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseData.id),
        eq(courseEnrollment.userId, userSession.userId)
      ),
    });
  }

  const chapterInfo = await db.query.chapter.findFirst({
    where: and(
      eq(chapter.moduleId, courseData.courseModule[0].id),
      eq(chapter.slug, params.slug[1])
    ),
    with: {
      courseModule: true,
      videoData: true,
      article: true,
      quiz: {
        with: {
          questions: {
            with: {
              answers: {
                columns: {
                  id: true,
                  questionId: true,
                  answerText: true,
                },
              },
            },
          },
          response: {
            where: eq(quizResponse.userId, userSession?.userId ?? ""),
            orderBy: desc(quizResponse.createdAt),
          },
        },
      },
    },
  });

  if (!chapterInfo) {
    return redirect("/");
  }

  return (
    <section className="h-full">
      <div className="flex items-center justify-start gap-5 px-3">
        <h2 className="my-5 text-center text-2xl font-bold">
          {chapterInfo?.title}
        </h2>
        {chapterInfo.type === "quiz" && (
          <>
            {userSession?.userId ? (
              <div className="flex items-center gap-5">
                {chapterInfo?.quiz[0].response.length > 0 ? (
                  <>
                    <p className="px-4 rounded-md text-white bg-blue-600 py-2">
                      Attempted at:{" "}
                      {formatDate(chapterInfo?.quiz[0].response[0].createdAt!)}
                    </p>
                  </>
                ) : (
                  <QuizDuration duration={chapterInfo.quiz[0].duration} />
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
      <div>
        {courseData?.isFree ||
        chapterInfo.isFree ||
        purchaseInfo ||
        isPartOfCourse ? (
          <div className="px-3 fill mx-auto rounded-t-md ">
            {chapterInfo.type === "video" && (
              <div className="flex items-center justify-center mx-auto max-w-[900px]">
                <VideoPlayerWithProgress
                  userId={userSession?.userId}
                  chapterId={chapterInfo.id}
                  autoPlay
                  playbackId={chapterInfo.videoData[0].playbackId!}
                  isEnrolled={!!isEnrolled}
                  courseId={courseData.id}
                />
              </div>
            )}

            {/* {chapterInfo.type === "quiz" && (
              <div className="flex  gap-5 flex-col">
                {chapterInfo.quiz[0].questions.map((question, index) => (
                  <ChapterQuiz
                    key={question.id}
                    index={index}
                    question={question}
                  />
                ))}
              </div>
            )} */}
            {chapterInfo.type === "quiz" && (
              <>
                {userSession?.userId ? (
                  <ChapterQuiz
                    chapterSlug={params.slug[1]}
                    courseId={courseData.id}
                    moduleId={courseData.courseModule[0].id}
                    chapterId={chapterInfo.id}
                  />
                ) : (
                  <>
                    <Button variant="app" asChild>
                      <Link href="/login">Log in to attempt quiz</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <div
            style={{ height: "400px" }}
            className="bg-slate-800 text-white flex flex-col items-center justify-center w-full"
          >
            <h3 className="text-center text-2xl font-bold mb-3">
              Chapter Locked
            </h3>
            <p className="text-center ">
              Please purchase the course to view all the chapters.
            </p>

            {!userSession ? (
              <>
                <Link
                  href="/login"
                  className="px-8 py-2 my-5 bg-blue-600 hover:bg-blue-500 rounded-full"
                >
                  Login
                </Link>
              </>
            ) : (
              <BuyCourse
                coursePrice={courseData?.price!}
                courseId={courseData.id}
                email={userSession.email}
                userId={userSession.userId!}
                userName={userSession.name}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapterPage;
