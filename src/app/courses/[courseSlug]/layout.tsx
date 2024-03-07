import React from "react";
import CourseSidebar from "../_components/course-sidebar";

import getUserSession from "@/actions/getUserSession";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import {
  Purchase,
  chapter,
  course,
  courseModule,
  purchase,
  user,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type CourseData = {
  id: string;
  title: string;
  slug: string;
  isFree: boolean;
  courseMember: {
    courseId: string;
    userId: string;
    role: "owner" | "admin" | "teacher";
  }[];
  courseModule: {
    id: string;
    title: string;
    chapter: {
      id: string;
      title: string;
      isFree: boolean;
    }[];
  }[];
};

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string; chapterSlug: string };
}) => {
  const courseData = await db.query.course.findFirst({
    where: eq(course.slug, params.courseSlug),
    columns: {
      id: true,
      title: true,
      isFree: true,
      slug: true,
    },
    with: {
      courseMember: true,
      courseModule: {
        columns: {
          title: true,
          id: true,
        },
        orderBy: courseModule.position,
        with: {
          chapter: {
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

  console.log("courseData", courseData?.courseModule[0].chapter);

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
    <div>
      <main className="flex h-full">
        <CourseSidebar
          courseData={courseData}
          courseSlug={params.courseSlug}
          isPartOfCourse={isPartOfCourse}
          purchaseInfo={purchaseInfo}
          chapterId={params?.chapterSlug}
        />
        <div className="pl-64 h-full w-full">{children}</div>
      </main>
    </div>
  );
};

export default CourseLayout;
