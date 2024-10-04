import { revalidateTag } from "next/cache";

export function clearCourseData(slug: string) {
  revalidateTag("get-course-data");
  revalidateTag(`get-course-data-${slug}`);
  revalidateTag("get-publised-course");
  revalidateTag("get-all-courses-admin");
}
