import { db } from "@/db";
import { courseCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import React from "react";
import CourseCard from "../../_components/course-card";

const FetchCategoryCourses = async ({ categoryId }: { categoryId: string }) => {
  const courseCategoryInfo = await db.query.courseCategory.findMany({
    where: eq(courseCategory.categoryId, categoryId),
    with: {
      course: {
        columns: {
          title: true,
          imageUrl: true,
          price: true,
          isFree: true,
          slug: true,
        },

        with: {
          courseModule: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
  });

  return (
    <>
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
    </>
  );
};

export default FetchCategoryCourses;
