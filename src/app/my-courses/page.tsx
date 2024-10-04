import { redirect } from "next/navigation";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getEnrolledCourses } from "@/db/queries/courses";

import MyCourseCard from "./_components/my-courses-card";

export type CourseWithProgress = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  validity: number | null;
  progress: number;
};
const MyCourses = async () => {
  const userSession = await getUserSessionRedis();

  if (!userSession) {
    return redirect("/");
  }

  const enrolledCourses = await getEnrolledCourses(userSession.userId);

  const courses = enrolledCourses.map(
    (purchase) => purchase.course
  ) as CourseWithProgress[];

  for (const course of courses) {
    const progress = await getProgress(userSession.userId, course.id);
    course["progress"] = progress.progressPercentage ?? 0;
  }

  return (
    <div className="md:p-6s p-3">
      <h2 className="my-5 text-center text-3xl font-bold">My Courses</h2>

      {enrolledCourses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          {enrolledCourses.map((courseInfo) => (
            <MyCourseCard
              key={courseInfo.id}
              courseInfo={courseInfo.course as CourseWithProgress}
              purchasedDate={courseInfo.createdAt!}
              validity={courseInfo.course.validity!}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-[250px] items-center justify-center">
          <h2 className="text-center text-2xl font-semibold">
            No Courses purchased yet
          </h2>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
