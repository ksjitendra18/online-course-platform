import { redirect } from "next/navigation";
import React from "react";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import { getEnrollmentStatus } from "@/db/queries/enrollment";

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

const CourseLayout = async (props: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string; slug: string[] }>;
}) => {
  const params = await props.params;

  const { children } = props;

  const userSession = await getUserSessionRedis();
  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  if (!courseData) {
    return redirect("/");
  }

  let completedChapterIds: string[] = [];
  let isPartOfCourse;
  let progressCount = 0;
  let isEnrolled = false;

  if (userSession) {
    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );

    isEnrolled = await getEnrollmentStatus({
      courseId: courseData.id,
      userId: userSession.userId,
    });

    if (isEnrolled) {
      const progressData = await getProgress(userSession.userId, courseData.id);
      completedChapterIds = progressData.completedChapters.map(
        (chapter) => chapter.chapterId
      );
      progressCount = progressData.progressPercentage ?? 0;
    }
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={!!isPartOfCourse}
        chapterSlug={params.slug[1]}
        moduleSlug={params.slug[0]}
        isEnrolled={isEnrolled}
        progressCount={progressCount}
        userId={userSession?.userId}
        completedChapterIds={completedChapterIds}
      />
      <div className="mx-auto mt-3 w-full">{children}</div>
    </div>
  );
};

export default CourseLayout;
