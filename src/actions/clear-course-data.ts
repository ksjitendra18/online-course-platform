import { revalidateTag } from "next/cache";

export function clearCourseData(courseId: string) {
  revalidateTag("get-course-data");
  revalidateTag("get-publised-course");
  revalidateTag("get-all-courses-admin");
}
