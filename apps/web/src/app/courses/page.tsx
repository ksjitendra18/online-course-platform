import { Suspense } from "react";

import CategoryLoading from "./_components/category-loading";
import CourseLoading from "./_components/course-loading";
import FetchCategories from "./fetch-categories";
import FetchCourse from "./fetch-courses";

export const metadata = {
  title: "Courses",
};

const CoursesPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const search =
    typeof searchParams.query === "string" ? searchParams.query : undefined;

  const currentSearchParams = new URLSearchParams();

  if (search) {
    currentSearchParams.set("query", search as string);
  }

  return (
    <section className="p-6">
      <Suspense fallback={<CategoryLoading />}>
        <FetchCategories />
      </Suspense>

      <Suspense fallback={<CourseLoading />}>
        <FetchCourse searchParams={searchParams} />
      </Suspense>
    </section>
  );
};

export default CoursesPage;
