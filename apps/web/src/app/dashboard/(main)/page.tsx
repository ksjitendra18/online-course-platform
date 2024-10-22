import { redirect } from "next/navigation";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getAnalytics } from "@/db/queries/course-analytics";
import { getPublishedCourses, getTotalEnrollments } from "@/db/queries/courses";

import { DataCard } from "./analytics/_components/data-card";

export const metadata = {
  title: "Dashboard",
};

const DashboardPage = async () => {
  const userInfo = await getUserSessionRedis();
  if (!userInfo) {
    return redirect("/login");
  }

  const [publishedCourses, totalEnrollments, analytics] = await Promise.all([
    getPublishedCourses(userInfo.userId),
    getTotalEnrollments(userInfo.userId),
    getAnalytics(userInfo.userId),
  ]);
  const { totalRevenue } = analytics;

  return (
    <section className="p-6">
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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
