import Image from "next/image";
import Link from "next/link";

import { BookOpen } from "lucide-react";

import { type Course, course } from "@/db/schema";

interface Props {
  courseInfo: Pick<Course, "title" | "imageUrl" | "isFree" | "price" | "slug">;
  moduleLength: number;
}

const CourseCard = ({ courseInfo, moduleLength }: Props) => {
  return (
    <>
      <Link href={`/courses/${courseInfo.slug}`}>
        <div className="group h-full overflow-hidden rounded-lg border p-3 transition hover:shadow-sm">
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              fill
              className="object-cover"
              alt={courseInfo.title}
              src={
                courseInfo.imageUrl ??
                "https://course-img-jsx.b-cdn.net/images/default-course-image.png"
              }
            />
          </div>
          <div className="flex flex-col pt-2">
            <div className="line-clamp-2 text-lg font-medium transition group-hover:text-sky-700 md:text-base">
              {courseInfo.title}
            </div>
          </div>

          <div className="my-2 flex items-center gap-x-1 text-slate-500">
            <div className="flex items-center justify-center rounded-full bg-sky-100 p-1">
              <BookOpen size={18} />
            </div>
            <span className="text-sm">
              {moduleLength} {moduleLength > 1 ? "Modules" : "Module"}
            </span>
          </div>

          <div className="my-5 w-fit rounded-md bg-blue-700 px-2 py-1 text-white">
            {courseInfo.isFree ? (
              <span>Free</span>
            ) : (
              <>&#8377;{courseInfo.price}</>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default CourseCard;
