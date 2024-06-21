import { redirect } from "next/navigation";
import React from "react";
import { DataCard } from "./analytics/_components/data-card";
import { db } from "@/db";
import { course, courseEnrollment, courseMember } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getAnalytics } from "@/db/queries/course-analytics";
import { getPublishedCourses, getTotalEnrollments } from "@/db/queries/courses";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

const DashboardPage = async () => {
  const userInfo = await getUserSessionRedis();
  if (!userInfo) {
    return redirect("/login");
  }
  // const publishedCourses = await db.query.course.findMany({
  //   columns: {
  //     id: true,
  //   },
  //   where: and(
  //     eq(course.isPublished, true),
  //     inArray(
  //       course.id,
  //       db
  //         .select({ id: courseMember.courseId })
  //         .from(courseMember)
  //         .where(eq(courseMember.userId, userInfo.userId))
  //     )
  //   ),
  // });

  // const totalEnrollments = await db.query.courseEnrollment.findMany({
  //   columns: {
  //     id: true,
  //   },
  //   where: inArray(
  //     courseEnrollment.courseId,
  //     db
  //       .select({ id: courseMember.courseId })
  //       .from(courseMember)
  //       .where(eq(courseMember.userId, userInfo.userId))
  //   ),
  // });

  const publishedCourses = await getPublishedCourses(userInfo.userId);
  const totalEnrollments = await getTotalEnrollments(userInfo.userId);
  const { totalRevenue } = await getAnalytics(userInfo.userId);
  return (
    <section className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <DataCard
          label="Total Published Course"
          value={publishedCourses.length}
        />
        <DataCard label="Total Enrollments" value={totalEnrollments.length} />
        <DataCard label="Total Revenue" shouldFormat value={totalRevenue} />
      </div>
    </section>
  );
};

export default DashboardPage;
