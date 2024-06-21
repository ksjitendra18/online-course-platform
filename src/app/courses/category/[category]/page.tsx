import { db } from "@/db";
import { category, courseCategory } from "@/db/schema";
import { eq } from "drizzle-orm";
import React, { Suspense } from "react";
import CategoriesCard from "../../_components/category-card";
import CourseCard from "../../_components/course-card";
import FetchCategories from "../../fetch-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import CategoryLoading from "../../_components/category-loading";
import CourseLoading from "../../_components/course-loading";
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

      <h2 className="my-5 text-center font-bold text-3xl">
        Courses for {categoryInfo?.name}
      </h2>
      <Suspense fallback={<CourseLoading />}>
        <FetchCategoryCourses categoryId={categoryInfo.id} />
      </Suspense>
    </div>
  );
};

export default CourseCategoryPage;
