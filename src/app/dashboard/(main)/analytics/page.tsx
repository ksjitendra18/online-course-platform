import { redirect } from "next/navigation";
import React from "react";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getAnalytics } from "@/db/queries/course-analytics";

import { Chart } from "./_components/chart";
import { DataCard } from "./_components/data-card";

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
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default AnalyticsPage;
