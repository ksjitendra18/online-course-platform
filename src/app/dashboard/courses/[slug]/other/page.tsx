import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import BasicInformation from "@/app/dashboard/components/basic-info-form";
import OtherInformation from "@/app/dashboard/components/other-info-form";
import { db } from "@/db";
import { course, user } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export const metadata = {
  title: "Other Info",
};
const OtherPage = async ({ params }: { params: { slug: string } }) => {
  const userSession = await getUserSessionRedis();
  if (!userSession) {
    return redirect("/");
  }
  const batchResponse = await db.batch([
    db.query.course.findFirst({
      where: eq(course.slug, params.slug as string),
    }),
    db.query.category.findMany(),
    db.query.user.findFirst({ where: eq(user.id, userSession.userId) }),
  ]);

  const courseInfo = batchResponse[0];
  const category = batchResponse[1];
  const userInfo = batchResponse[2];

  if (!courseInfo) {
    return redirect("/");
  }
  return (
    <section className="px-6 py-3 w-full">
      <div className="flex my-5 gap-1 items-center justify-between">
        <Link
          className={cn(
            "flex-1 py-3 rounded-l-md bg-green-500 text-white w-full flex items-center justify-center"
          )}
          href={`#`}
        >
          Step 1: Basic Information
        </Link>
        <Link
          className="flex-1 py-3 bg-green-500 text-white w-full flex items-center justify-center"
          href={`/dashboard/courses/${courseInfo?.slug}/modules`}
        >
          Step 2: Course Modules
        </Link>
        <Link
          className="flex-1 py-3 rounded-r-md bg-blue-500 text-white w-full flex items-center justify-center"
          href={`/dashboard/courses/${courseInfo?.slug}/other`}
        >
          Step 3: Other Information
        </Link>
      </div>

      <div className="flex justify-between md:justify-start gap-x-3 items-center">
        <h1 className="text-2xl font-bold my-3">Edit Course Details</h1>
      </div>
      <OtherInformation
        courseSlug={courseInfo?.slug}
        courseId={courseInfo?.id}
        isFree={courseInfo?.isFree}
        coursePrice={courseInfo?.price}
        categories={category}
        exisitingImage={courseInfo?.imageUrl}
        teacherName={userInfo?.name}
      />
    </section>
  );
};

export default OtherPage;
