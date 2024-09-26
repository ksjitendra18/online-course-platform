import { redirect } from "next/navigation";
import React, { Suspense } from "react";

import { eq } from "drizzle-orm";

import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/db";
import { category, courseCategory } from "@/db/schema";

import CategoriesCard from "../../_components/category-card";
import CategoryLoading from "../../_components/category-loading";
import CourseCard from "../../_components/course-card";
import CourseLoading from "../../_components/course-loading";
import FetchCategories from "../../fetch-categories";
import FetchCategoryCourses from "../_components/fetch-category-courses";

export const metadata = {
  title: "Courses",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const CourseCategoryPage = async ({
  params,
}: {
  params: { category: string };
}) => {
  const categoryInfo = await db.query.category.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: eq(category.slug, params.category),
  });

  if (!categoryInfo) {
    return redirect("/courses");
  }

  return (
    <div className="p-6">
      <Suspense fallback={<CategoryLoading />}>
        <FetchCategories currentCategory={params.category} />
      </Suspense>

      <h2 className="my-5 text-center text-3xl font-bold">
        Courses for {categoryInfo?.name}
      </h2>
      <Suspense fallback={<CourseLoading />}>
        <FetchCategoryCourses categoryId={categoryInfo.id} />
      </Suspense>
    </div>
  );
};

export default CourseCategoryPage;
