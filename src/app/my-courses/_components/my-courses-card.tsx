import { course, type Course } from "@/db/schema";
import { BookOpen } from "lucide-react";
import Link from "next/link";
interface Props {
  courseInfo: Course;
  purchasedDate: string | undefined;
  validity: number | undefined;
}

const MyCourseCard = ({ courseInfo, purchasedDate, validity }: Props) => {
  return (
    <>
      <Link href={`/courses/${courseInfo.slug}`}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <img
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

            <div>Purchased on : {purchasedDate}</div>
            {validity && validity > 0 && <div>Purchased on : {validity}</div>}
          </div>
        </div>
      </Link>
    </>
  );
};

export default MyCourseCard;
