import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";
import CourseCard from "./_components/course-card";
import { db } from "@/db";
import { and, eq, like } from "drizzle-orm";
import { course } from "@/db/schema";

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};
const FetchCourse = async ({ searchParams }: Props) => {
  const search =
    typeof searchParams.query === "string" ? searchParams.query : undefined;

  const currentSearchParams = new URLSearchParams();

  if (search) {
    currentSearchParams.set("query", search as string);
  }

  const courses = await db.query.course.findMany({
    columns: {
      id: true,
      title: true,
      imageUrl: true,
      price: true,
      isFree: true,
      slug: true,
    },
    where: and(
      eq(course.isPublished, true),
      like(course.title, `%${search ? search : ""}%`)
    ),

    with: {
      courseModule: {
        columns: {
          id: true,
        },
      },
    },
  });
  return (
    <div className="grid my-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          moduleLength={course.courseModule.length}
          courseInfo={course}
        />
      ))}
    </div>
  );
};

export default FetchCourse;
