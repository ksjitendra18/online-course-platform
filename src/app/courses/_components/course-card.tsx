import { course, type Course } from "@/db/schema";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface Props {
  courseInfo: Pick<Course, "title" | "imageUrl" | "isFree" | "price" | "slug">;
  moduleLength: number;
}

const CourseCard = ({ courseInfo, moduleLength }: Props) => {
  return (
    <>
      <Link href={`/courses/${courseInfo.slug}`}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
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
            <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
              {courseInfo.title}
            </div>
          </div>

          <div className="flex my-2 items-center gap-x-1 text-slate-500">
            <div className="rounded-full flex items-center justify-center bg-sky-100 p-1">
              <BookOpen size={18} />
            </div>
            <span className="text-sm">
              {moduleLength} {moduleLength > 1 ? "Modules" : "Module"}
            </span>
          </div>

          <div className="bg-blue-700 my-5 w-fit text-white px-2 py-1 rounded-md">
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
