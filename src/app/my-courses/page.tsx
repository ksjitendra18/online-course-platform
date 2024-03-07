import React from "react";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { purchase } from "@/db/schema";
import { redirect } from "next/navigation";
import CourseCard from "../courses/_components/course-card";
import MyCourseCard from "./_components/my-courses-card";
const MyCourses = async () => {
  const userSession = await getUserSessionRedis();

  if (!userSession) {
    return redirect("/");
  }

  const purchasedCourses = await db.query.purchase.findMany({
    where: eq(purchase.userId, userSession.userId),
    with: {
      course: true,
    },
  });

  return (
    <div className="p-3 md:p-6s ">
      <h2 className="my-5 text-center text-3xl font-bold">My Courses</h2>

      {purchasedCourses.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {purchasedCourses.map((courseInfo) => (
            <MyCourseCard
              key={courseInfo.id}
              courseInfo={courseInfo.course}
              purchasedDate={courseInfo.createdAt!}
              validity={courseInfo.course.validity!}
            />
          ))}
        </div>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <h2 className="text-center text-2xl font-semibold">
            No Courses purchased yet
          </h2>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
