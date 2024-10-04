import Link from "next/link";

import { type IconType } from "react-icons";

import { cn } from "@/lib/utils";

interface CategoryItemProps {
  label: string;
  value?: string;
  icon?: IconType;
  id: string;
  slug: string;
  currentCategoryId?: string;
  currentCategory?: string;
}

export const CategoryItem = ({
  label,
  icon: Icon,
  slug,
  currentCategory,
}: CategoryItemProps) => {
  const isSelected = currentCategory === slug;

  return (
    <Link
      href={`/courses/category/${slug}`}
      className={cn(
        "flex items-center gap-x-1 rounded-full border border-slate-200 px-3 py-2 text-sm transition hover:border-sky-700",
        isSelected && "border-sky-700 bg-sky-200/20 text-sky-800"
      )}
      type="button"
    >
      {Icon && <Icon size={20} />}
      <div className="truncate">{label}</div>
    </Link>
  );
};
