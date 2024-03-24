import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import { Purchase, chapter, course, courseModule, purchase } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import BuyCourse from "../_components/buy-course";
import CourseSidebar from "../_components/course-sidebar";

const CoursePage = async ({ params }: { params: { courseSlug: string } }) => {
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
        columns: {
          title: true,
          id: true,
          slug: true,
        },
        orderBy: courseModule.position,
        with: {
          chapter: {
            columns: {
              id: true,
              title: true,
              isFree: true,
              slug: true,
            },
            orderBy: chapter.position,
          },
        },
      },
    },
  });

  const userSession = await getUserSessionRedis();

  if (!courseData) {
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

  return (
    <main className="flex h-full">
      <div className="hidden md:flex">
        <CourseSidebar
          courseData={courseData}
          courseSlug={params.courseSlug}
          isPartOfCourse={isPartOfCourse}
          purchaseInfo={purchaseInfo}
        />
      </div>
      <div className="md:pl-80 my-5  h-full w-full">
        <div className="flex items-center justify-center">
          <img src={courseData.imageUrl!} width="400" />
        </div>
        <h1 className="text-2xl font-bold mt-5 text-center">
          {courseData.title}
        </h1>
        <p className="my-2 text-center">{courseData.description}</p>

        <div className="flex my-5 items-center justify-center gap-3">
          {!courseData.isFree && !purchaseInfo ? (
            <div>
              {userSession ? (
                <BuyCourse
                  userId={userSession.userId}
                  userName={userSession.name}
                  courseId={courseData.id}
                  coursePrice={courseData?.price}
                  email={userSession.email!}
                />
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-500 text-white rounded-md px-7 py-2"
                >
                  Login and Buy
                </Link>
              )}
            </div>
          ) : (
            <>
              {!userSession ? (
                <Link
                  href="/login"
                  className="bg-blue-500 text-white rounded-md px-7 py-2"
                >
                  Login and View
                </Link>
              ) : (
                <Link
                  className="bg-blue-500 text-white rounded-md px-7 py-2"
                  href={`/courses/${courseData.slug}/${courseData.courseModule[0].slug}/${courseData.courseModule[0].chapter[0].slug}`}
                >
                  View Course
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default CoursePage;
