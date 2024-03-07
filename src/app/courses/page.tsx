import { db } from "@/db";
import { course } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import CourseCard from "./_components/course-card";
import CategoryCard from "./_components/category-card";

export const metadata = {
  title: "Courses",
};
const CoursesPage = async () => {
  const courses = await db.query.course.findMany({
    where: eq(course.isPublished, true),

    with: {
      courseModule: true,
    },
  });

  const categories = await db.query.category.findMany({});
  return (
    <section className="p-6">
      <CategoryCard items={categories} />
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            moduleLength={course.courseModule.length}
            courseInfo={course}
          />
        ))}
      </div>
    </section>
  );
};

export default CoursesPage;
