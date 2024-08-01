import { getUserSessionRedis } from "@/db/queries/auth";
import {
  getAllCoursesByUserId,
  getDynamicCoursesByUserId,
} from "@/db/queries/courses";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
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
      <section className="p-6 w-full">
        <h1 className="text-2xl font-bold my-3">Courses</h1>

        <div className="flex items-center my-3 justify-between">
          <DashboardCourseSearch existingSearchTerm={search ?? ""} />

          <Link
            className="bg-blue-600 px-5 py-2  text-white rounded-md"
            href="/dashboard/courses/create"
          >
            Add New Course
          </Link>
        </div>
      </section>

      <section className="p-6  items-center auto-rows-[1fr] gap-5 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 ">
        {memberCourses?.map((memberCourse) => (
          <div
            key={memberCourse.courseId}
            className="border-2 flex flex-col justify-between relative w-full h-full rounded-md border-blue-600"
          >
            {/* width unknown how to do? */}
            <div className=" w-full aspect-video rounded-md overflow-hidden">
              <img
                alt="Course Image"
                src={
                  memberCourse.course.imageUrl ??
                  "https://cdn.learningapp.link/images/default-course-image.png"
                }
                className="object-cover rounded-t-md"
              />
            </div>
            <div className="flex  px-4 mt-2 flex-col">
              <h3 className="text-lg truncate font-medium text-center mb-4 text-blue-600">
                {memberCourse.course.title}
              </h3>

              <div className="flex items-center  justify-between rounded-md  gap-1  mb-4">
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
                  className="flex items-center justify-center py-2 px-2 rounded-lg border-2 border-blue-600 bg-blue-600 text-white text-base w-fit mb-2"
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
