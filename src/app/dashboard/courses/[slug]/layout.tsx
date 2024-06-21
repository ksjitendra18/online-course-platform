import React from "react";
import DashboardSidebar from "../../components/dashboard-sidebar";
import { getUserSessionRedis } from "@/db/queries/auth";
import { redirect } from "next/navigation";
import CourseSidebar from "../../components/course-sidebar";
import { getCourseData } from "@/db/queries/courses";
import { db } from "@/db";
import { course, courseMember } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
  const currentUser = await getUserSessionRedis();

  if (!currentUser) {
    return redirect("/login");
  }

  if (!currentUser.staff) {
    return redirect("/");
  }

  const courseData = await db.query.course.findFirst({
    columns: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
    },
    where: and(
      eq(course.slug, params.slug),
      inArray(
        course.id,
        db
          .select({ id: courseMember.courseId })
          .from(courseMember)
          .where(eq(courseMember.userId, currentUser.userId))
      )
    ),
  });

  if (!courseData) {
    return redirect("/");
  }
  return (
    <div className="flex h-full">
      <CourseSidebar
        isPublished={courseData.isPublished}
        title={courseData.title}
        slug={params.slug}
      />
      <div className=" h-full w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
