import Image from "next/image";
import Link from "next/link";

import { getAllCoursesByUserId } from "@/db/queries/courses";
import { formatPrice } from "@/lib/utils";

export const FetchMemberCourses = async ({
  search,
  userId,
}: {
  search: string | undefined;
  userId: string;
}) => {

  const memberCourses = await getAllCoursesByUserId(userId, search);

  return (
    <>
      <section className="grid auto-rows-[1fr] items-center gap-5 p-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {memberCourses?.map((memberCourse) => (
          <div
            key={memberCourse.courseId}
            className="relative flex h-full w-full flex-col justify-between rounded-md border-2 border-blue-600"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <Image
                alt="Course Image"
                fill
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
      ;
    </>
  );
};
