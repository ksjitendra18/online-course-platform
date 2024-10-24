import { unstable_cache } from "next/cache";

import { and, eq } from "drizzle-orm";

import { db } from "..";
import { courseEnrollment } from "../schema";

export const getEnrollmentStatus = unstable_cache(
  async ({ courseId, userId }: { courseId: string; userId: string }) => {
    const enrollmentStatus = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, userId)
      ),
    });

    return !!enrollmentStatus;
  },
  ["get-enrollment-status"],
  { revalidate: 7200, tags: ["get-enrollment-status"] }
);
