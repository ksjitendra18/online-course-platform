import React, { ReactNode } from "react";
import CourseSidebar from "../../_components/course-sidebar";
import { getCourseData } from "@/db/queries/courses";
import { redirect } from "next/navigation";
import {
  CourseEnrollment,
  Purchase,
  courseEnrollment,
  purchase,
} from "@/db/schema";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";

const DiscussionLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: { courseSlug: string };
}) => {
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
    <div className="flex lg:flex-row flex-col-reverse">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        userHasEnrolled={!!userHasEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="lg:pl-80 h-full w-full">{children}</div>
    </div>
  );
};

export default DiscussionLayout;
