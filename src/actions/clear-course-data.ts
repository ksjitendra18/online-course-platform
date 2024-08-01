import { revalidateTag } from "next/cache";

export function clearCourseData(courseId: string) {
  revalidateTag("get-course-data");
  revalidateTag("get-all-courses-admin");
}
