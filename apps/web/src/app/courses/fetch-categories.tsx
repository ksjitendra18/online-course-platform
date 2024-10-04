import { db } from "@/db";

import CategoryCard from "./_components/category-card";

const FetchCategories = async ({
  currentCategory,
}: {
  currentCategory?: string;
}) => {
  const categories = await db.query.category.findMany({});

  return <CategoryCard currentCategory={currentCategory} items={categories} />;
};

export default FetchCategories;
