import React from "react";
import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";
import { getAnalytics } from "@/db/queries/course-analytics";
import { getUserSessionRedis } from "@/db/queries/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const AnalyticsPage = async () => {
  const userInfo = await getUserSessionRedis();

  if (!userInfo) {
    redirect("/login");
  }
  const { data, totalRevenue, totalSales } = await getAnalytics(
    userInfo.userId
  );
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default AnalyticsPage;
