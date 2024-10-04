import Link from "next/link";
import { redirect } from "next/navigation";

import { getUserSessionRedis } from "@/db/queries/auth";
import {
  getAllCoursesByUserId
} from "@/db/queries/courses";
import { formatPrice } from "@/lib/utils";

import DashboardCourseSearch from "../../components/dashboard-search";

export const metadata = {
  title: "Manage Course",
};
const Courses = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
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

  const memberCourses = await getAllCoursesByUserId(currentUser.userId, search);

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

      <section className="grid auto-rows-[1fr] items-center gap-5 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {memberCourses?.map((memberCourse) => (
          <div
            key={memberCourse.courseId}
            className="relative flex h-full w-full flex-col justify-between rounded-md border-2 border-blue-600"
          >
            {/* width unknown how to do? */}
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img
                alt="Course Image"
                src={
                  memberCourse.course.imageUrl ??
                  "https://cdn.learningapp.link/images/default-course-image.png"
                }
                className="rounded-t-md object-cover"
              />
            </div>
            <div className="mt-2 flex flex-col px-4">
              <h3 className="mb-4 truncate text-center text-lg font-medium text-blue-600">
                {memberCourse.course.title}
              </h3>

              <div className="mb-4 flex items-center justify-between gap-1 rounded-md">
                <div className="">
                  {memberCourse.course.courseModule.length} Modules
                </div>
                <div className="">
                  {memberCourse.course.isFree ? (
                    <div className="">Free</div>
                  ) : (
                    <div className="">
                      {!memberCourse.course.isFree && (
                        <div className="">
                          {" "}
                          {formatPrice(memberCourse.course.price!)}{" "}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* {!memberCourse.course.isFree && <div className="bg-[#6320ee] rounded-full px-1">{memberCourse.course.price}</div>} */}
                <div>
                  {memberCourse.course.validity &&
                  memberCourse.course.validity > 0 ? (
                    <>{memberCourse.course.validity}days</>
                  ) : (
                    <>Unlimited</>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Link
                  href={`/dashboard/courses/${memberCourse.course.slug}/basic`}
                  className="mb-2 flex w-fit items-center justify-center rounded-lg border-2 border-blue-600 bg-blue-600 px-2 py-2 text-base text-white"
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default Courses;
