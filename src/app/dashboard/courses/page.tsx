import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import { course, courseMember } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "Manage Course",
};
const Courses = async () => {
  const currentUser = await getUserSessionRedis();

  const courses = await db.query.course.findMany({
    with: {
      courseMember: {
        where: eq(courseMember.userId, currentUser?.userId!),
      },
    },
  });
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

          <a
            className="bg-blue-600 px-5 py-2 text-white rounded-md"
            href="/dashboard/courses/create"
          >
            Add New Course
          </a>
        </div>
      </section>

      <section className="p-6 flex items-center gap-5">
        {courses.map((course) => (
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
