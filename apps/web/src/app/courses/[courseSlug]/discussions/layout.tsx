import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import { getEnrollmentStatus } from "@/db/queries/enrollment";

import CourseSidebar from "../../_components/course-sidebar";

const DiscussionLayout = async (props: {
  children: ReactNode;
  params: Promise<{ courseSlug: string }>;
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

  let isPartOfCourse = false;
  let completedChapterIds: string[] = [];

  let progressCount = 0;
  let isEnrolled: boolean = false;

  if (userSession) {
    isPartOfCourse = courseData.courseMember.some(
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
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        isEnrolled={isEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="h-full w-full lg:pl-80">{children}</div>
    </div>
  );
};

export default DiscussionLayout;
