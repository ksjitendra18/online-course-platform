import { db } from "@/db";
import React, { Suspense } from "react";
import CategoryCard from "./_components/category-card";
import { Skeleton } from "@/components/ui/skeleton";

const FetchCategories = async ({
  currentCategory,
}: {
  currentCategory?: string;
}) => {
  const categories = await db.query.category.findMany({});

  return <CategoryCard currentCategory={currentCategory} items={categories} />;
};

export default FetchCategories;
