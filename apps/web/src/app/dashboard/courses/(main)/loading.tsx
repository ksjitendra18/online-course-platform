import Link from "next/link";

import CourseLoading from "@/app/courses/_components/course-loading";

import DashboardCourseSearch from "../../components/dashboard-search";

export const metadata = {
  title: "Dashboard",
};

const CourseLoadingPage = async () => {
  return (
    <>
      <section className="w-full p-6">
        <h1 className="my-3 text-2xl font-bold">Courses</h1>

        <div className="my-3 flex items-center justify-between">
          <DashboardCourseSearch existingSearchTerm={""} />

          <Link
            className="rounded-md bg-blue-600 px-5 py-2 text-white"
            href="/dashboard/courses/create"
          >
            Add New Course
          </Link>
        </div>
      </section>

      <CourseLoading />
    </>
  );
};

export default CourseLoadingPage;
