import { db } from "@/db";
import { category, courseCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import CategoriesCard from "../../_components/category-card";
import CourseCard from "../../_components/course-card";

export const metadata = {
  title: "Courses",
};
const CourseCategoryPage = async ({
  params,
}: {
  params: { category: string };
}) => {
  const categoryInfo = await db.query.category.findFirst({
    where: eq(category.slug, params.category),
  });

  const categories = await db.query.category.findMany({});
  const courseCategoryInfo = await db.query.courseCategory.findMany({
    where: eq(courseCategory.categoryId, categoryInfo?.id!),
    with: {
      course: {
        with: {
          courseModule: true,
        },
      },
    },
  });

  return (
    <div className="p-6">
      <CategoriesCard currentCategory={params.category} items={categories} />

      <h2 className="mb-5 text-center font-bold text-3xl">
        Courses for {categoryInfo?.name}
      </h2>
      {courseCategoryInfo.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {courseCategoryInfo.map((courseInfo) => (
            <CourseCard
              key={courseInfo.courseId}
              moduleLength={courseInfo.course.courseModule.length}
              courseInfo={courseInfo.course}
            />
          ))}
        </div>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <h2 className="text-center text-2xl font-semibold">
            No Courses in this category
          </h2>
        </div>
      )}
    </div>
  );
};

export default CourseCategoryPage;
