import { unstable_cache } from "next/cache";

import { db } from "@/db";

import CategoryCard from "./_components/category-card";

const fetchCategories = unstable_cache(
  async () => {
    return await db.query.category.findMany();
  },

  ["get-published-course"],
  { revalidate: 7200, tags: ["get-published-courses"] }
);

const FetchCategories = async ({
  currentCategory,
}: {
  currentCategory?: string;
}) => {
  const categories = await fetchCategories();
  return <CategoryCard currentCategory={currentCategory} items={categories} />;
};

export default FetchCategories;
