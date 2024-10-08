import { redirect } from "next/navigation";
import React from "react";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import {
  CourseEnrollment,
  Purchase,
  courseEnrollment,
  purchase
} from "@/db/schema";

import CourseSidebar from "../../_components/course-sidebar";

export type CourseData = {
  id: string;
  title: string;
  slug: string;
  isFree: boolean;
  courseMember: {
    courseId: string;
    userId: string;
    role: "owner" | "admin" | "teacher" | "auditor";
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

  let completedChapterIds: string[] = [];
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
    const progressData = await getProgress(userSession.userId, courseData.id);
    completedChapterIds = progressData.completedChapters.map(
      (chapter) => chapter.chapterId
    );
    progressCount = progressData.progressPercentage ?? 0;
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={!!isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterSlug={params.slug[1]}
        moduleSlug={params.slug[0]}
        userHasEnrolled={!!userHasEnrolled}
        progressCount={progressCount}
        userId={userSession?.userId}
        completedChapterIds={completedChapterIds}
      />
      <div className="mx-auto mt-3 w-full">{children}</div>
    </div>
  );
};

export default CourseLayout;
