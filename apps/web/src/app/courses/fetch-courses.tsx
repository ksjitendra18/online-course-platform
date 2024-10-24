import { getPublishedCourses } from "@/db/queries/courses";

import CourseCard from "./_components/course-card";

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};
const FetchCourse = async ({ searchParams }: Props) => {
  const search =
    typeof searchParams.query === "string" ? searchParams.query : undefined;

  const currentSearchParams = new URLSearchParams();

  if (search) {
    currentSearchParams.set("query", search as string);
  }

  const courses = await getPublishedCourses(search);
  return (
    <div className="my-5 grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          moduleLength={course.courseModule.length}
          courseInfo={course}
        />
      ))}
    </div>
  );
};

export default FetchCourse;
