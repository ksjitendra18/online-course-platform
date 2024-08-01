import { getUserSessionRedis } from "@/db/queries/auth";
import { getAnalytics } from "@/db/queries/course-analytics";
import { getPublishedCourses, getTotalEnrollments } from "@/db/queries/courses";
import { redirect } from "next/navigation";
import { DataCard } from "./analytics/_components/data-card";

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

  const [publishedCourses, totalEnrollments, analytics] = await Promise.all([
    getPublishedCourses(userInfo.userId),
    getTotalEnrollments(userInfo.userId),
    getAnalytics(userInfo.userId),
  ]);
  const { totalRevenue } = analytics;

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
