import CourseProgress from "@/app/courses/_components/course-progress";
import { course, type Course } from "@/db/schema";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseWithProgress } from "../page";
import Image from "next/image";

interface Props {
  courseInfo: CourseWithProgress;
  purchasedDate: string;
  validity: number | undefined;
}

const MyCourseCard = ({ courseInfo, purchasedDate, validity }: Props) => {
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

            <div>
              Enrolled on :{" "}
              {Intl.DateTimeFormat("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(purchasedDate))}
            </div>
            {Number(validity) > 0 && <div>Validity on : {validity}</div>}

            <div className="my-3">
              <CourseProgress value={courseInfo.progress} />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

export default MyCourseCard;
