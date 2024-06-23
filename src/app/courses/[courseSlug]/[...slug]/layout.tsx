import React from "react";
import CourseSidebar from "../../_components/course-sidebar";

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
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCourseData } from "@/db/queries/courses";
import { getProgress } from "@/db/queries/course-progress";

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
    slug: string;
    chapter: {
      id: string;
      title: string;
      isFree: boolean;
      slug: string;
      type: "quiz" | "video" | "attachment" | "article";
      progress: {
        id: string;
        createdAt: string;
        courseId: string;
        chapterId: string;
        userId: string;
        isCompleted: boolean;
      }[];
    }[];
  }[];
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string; slug: string[] };
}) => {
  const userSession = await getUserSessionRedis();
  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  if (!courseData) {
    return redirect("/");
  }

  let purchaseInfo: Purchase | undefined;
  let isPartOfCourse;
  let progressCount = -1;
  let userHasEnrolled: CourseEnrollment | undefined;

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

    userHasEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseData.id),
        eq(courseEnrollment.userId, userSession.userId)
      ),
    });
    progressCount = await getProgress(userSession.userId, courseData.id);
  }

  return (
    <div className="flex lg:flex-row flex-col-reverse">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterSlug={params.slug[1]}
        moduleSlug={params.slug[0]}
        userHasEnrolled={!!userHasEnrolled}
        progressCount={progressCount}
        userId={userSession?.userId}
      />
      <div className="lg:pl-80 h-full w-full">{children}</div>
    </div>
  );
};

export default CourseLayout;
