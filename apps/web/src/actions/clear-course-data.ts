import { revalidateTag } from "next/cache";

export function clearCourseData() {
  revalidateTag("get-course-data");
  revalidateTag("get-admin-published-course-length");
  revalidateTag("get-publised-courses");
  revalidateTag("get-all-courses-admin");
  revalidateTag("get-course-metadata");
  revalidateTag("get-admin-published-course-length");
}
