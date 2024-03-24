import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import { Course, course, courseMember, organization, user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

type CourseData = Pick<Course, "id" | "slug" | "title">;

export const metadata = {
  title: "Manage Course",
};
const Courses = async () => {
  const currentUser = await getUserSessionRedis();

  if (!currentUser) {
    return redirect("/login");
  }

  const memberCourses = await db.query.courseMember.findMany({
    where: eq(courseMember.userId, currentUser.userId),
    with: {
      course: {
        columns: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  const courses: CourseData[] = [];
  memberCourses.forEach((orgCourse) => courses.push(orgCourse.course));

  console.log(`orgcourses`, courses);

  return (
    <>
      <section className="p-6 w-full">
        <h1 className="text-2xl font-bold my-3">Courses</h1>

        <div className="flex items-center my-3 justify-between">
          <input
            type="text"
            className="bg-transparent border-2 w-1/2 border-slate-300 px-3 py-2 rounded-md"
            placeholder="Search Course"
          />

          <Link
            className="bg-blue-600 px-5 py-2  text-white rounded-md"
            href="/dashboard/courses/create"
          >
            Add New Course
          </Link>
        </div>
      </section>

      <section className="p-6 flex items-center gap-5">
        {courses?.map((course) => (
          <div key={course.id} className="border-2 px-5 py-3">
            <h3 className="text-xl font-medium">{course.title}</h3>
            <Link href={`/dashboard/courses/${course.slug}/basic`}>Manage</Link>
          </div>
        ))}
      </section>
    </>
  );
};

export default Courses;
