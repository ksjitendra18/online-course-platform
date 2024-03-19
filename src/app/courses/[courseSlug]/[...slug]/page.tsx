import React from "react";
import BuyCourse from "../../_components/buy-course";
import VideoPlayer from "../../_components/video-player";

import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import { Purchase, chapter, course, courseModule, purchase } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  console.log("courseData", params.slug, courseData?.courseModule.length);

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

  if (userSession) {
    // const userInfo = await db.query.user.findFirst({
    //   where: eq(user.id, userSession.userId),
    // });

    purchaseInfo = await db.query.purchase.findFirst({
      where: and(
        eq(purchase.courseId, courseData.id),
        eq(purchase.userId, userSession.userId)
      ),
    });

    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );
  }

  const chapterInfo = await db.query.chapter.findFirst({
    where: and(
      eq(chapter.moduleId, courseData.courseModule[0].id),
      eq(chapter.slug, params.slug[1])
    ),
    with: {
      courseModule: true,
    },
  });

  if (!chapterInfo) {
    return redirect("/");
  }

  return (
    <section className="h-full">
      <h2 className="my-5 text-center text-3xl font-bold">
        {chapterInfo?.title}
      </h2>
      <div>
        {courseData?.isFree ||
        chapterInfo.isFree ||
        purchaseInfo ||
        isPartOfCourse ? (
          <div className="px-3 fill  rounded-t-md ">
            <VideoPlayer videoId={chapterInfo.videoUrl!} />
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
