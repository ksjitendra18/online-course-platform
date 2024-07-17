import { Category } from "@/db/schema";
import { CategoryItem } from "./category-item";

interface CategoriesCardProps {
  items: Category[];
  currentCategoryId?: string;
  currentCategory?: string;
}

import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";
import { FaJava } from "react-icons/fa";
import { MdEmojiPeople, MdWeb } from "react-icons/md";
import { type IconType } from "react-icons";
import { FaC, FaDatabase, FaNodeJs, FaPython, FaReact } from "react-icons/fa6";

const iconMap: Record<Category["name"], IconType> = {
  "CS Core": FcMultipleDevices,
  Engineering: FcEngineering,
  Java: FaJava,
  "Web Development": MdWeb,
  Python: FaPython,
  "C / C++": FaC,
  React: FaReact,
  SQL: FaDatabase,
  "Node.js": FaNodeJs,
};

const CategoriesCard = ({ items, currentCategory }: CategoriesCardProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item, index) => (
        <CategoryItem
          key={index}
          id={item.id}
          slug={item.slug}
          label={item.name}
          value={item.id}
          icon={iconMap[item.name]}
          currentCategory={currentCategory}
        />
      ))}
    </div>
  );
};

export default CategoriesCard;
