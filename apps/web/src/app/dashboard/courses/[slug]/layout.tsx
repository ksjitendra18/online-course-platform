import { redirect } from "next/navigation";
import React from "react";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { course, courseMember } from "@/db/schema";

import CourseDashboardSidebar from "../../components/course-dashboard-sidebar";

const DashboardLayout = async (props: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) => {
  const params = await props.params;

  const { children } = props;

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
      status: true,
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
      <CourseDashboardSidebar
        status={courseData.status}
        title={courseData.title}
        slug={params.slug}
        courseId={courseData.id}
      />
      <div className="h-full w-full">{children}</div>
    </div>
  );
};

export default DashboardLayout;
