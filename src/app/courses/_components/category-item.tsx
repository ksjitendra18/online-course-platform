import { type IconType } from "react-icons";

import { cn } from "@/lib/utils";
import Link from "next/link";

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
  id,
  value,
  icon: Icon,
  slug,
  currentCategoryId,
  currentCategory,
}: CategoryItemProps) => {
  const isSelected = currentCategory === slug;

  return (
    <Link
      href={`/courses/category/${slug}`}
      className={cn(
        "py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-sky-700 transition",
        isSelected && "border-sky-700 bg-sky-200/20 text-sky-800"
      )}
      type="button"
    >
      {Icon && <Icon size={20} />}
      <div className="truncate">{label}</div>
    </Link>
  );
};
