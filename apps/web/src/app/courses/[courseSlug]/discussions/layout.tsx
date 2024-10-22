import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import {
  CourseEnrollment,
  Purchase,
  courseEnrollment,
  purchase,
} from "@/db/schema";

import CourseSidebar from "../../_components/course-sidebar";

const DiscussionLayout = async (
  props: {
    children: ReactNode;
    params: Promise<{ courseSlug: string }>;
  }
) => {
  const params = await props.params;

  const {
    children
  } = props;

  const userSession = await getUserSessionRedis();
  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  console.log("layout", !courseData, !!courseData);

  if (!courseData) {
    return redirect("/");
  }

  let purchaseInfo: Purchase | undefined;
  let isPartOfCourse;
  let completedChapterIds: string[] = [];

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
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        userHasEnrolled={!!userHasEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="h-full w-full lg:pl-80">{children}</div>
    </div>
  );
};

export default DiscussionLayout;
