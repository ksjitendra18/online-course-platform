import Image from "next/image";
import Link from "next/link";

import CourseProgress from "@/app/courses/_components/course-progress";

import { CourseWithProgress } from "../page";

interface Props {
  courseInfo: CourseWithProgress;
  purchasedDate: number;
  validity: number | undefined;
}

const MyCourseCard = ({ courseInfo, purchasedDate, validity }: Props) => {
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

            <div>
              Enrolled on :{" "}
              {Intl.DateTimeFormat("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(new Date(purchasedDate * 1000))}
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
