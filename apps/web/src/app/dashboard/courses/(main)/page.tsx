import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import CourseLoading from "@/app/courses/_components/course-loading";
import { getUserSessionRedis } from "@/db/queries/auth";

import DashboardCourseSearch from "../../components/dashboard-search";
import { FetchMemberCourses } from "./fetch-member-courses";

export const metadata = {
  title: "Manage Course",
};
const Courses = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const search =
    typeof searchParams.courseName === "string"
      ? searchParams.courseName
      : undefined;

  const currentSearchParams = new URLSearchParams();

  if (search) {
    currentSearchParams.set("courseName", search as string);
  }
  const currentUser = await getUserSessionRedis();

  if (!currentUser) {
    return redirect("/login");
  }

  return (
    <>
      <section className="w-full p-6">
        <h1 className="my-3 text-2xl font-bold">Courses</h1>

        <div className="my-3 flex items-center justify-between">
          <DashboardCourseSearch existingSearchTerm={search ?? ""} />

          <Link
            className="rounded-md bg-blue-600 px-5 py-2 text-white"
            href="/dashboard/courses/create"
          >
            Add New Course
          </Link>
        </div>
      </section>

      <Suspense fallback={<CourseLoading length={3} />}>
        <FetchMemberCourses search={search} userId={currentUser.userId} />
      </Suspense>
    </>
  );
};

export default Courses;
