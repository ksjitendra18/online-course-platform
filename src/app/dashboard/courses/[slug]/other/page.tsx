import { getUserSessionRedis } from "@/db/queries/auth";
import BasicInformation from "@/app/dashboard/components/basic-info-form";
import OtherInformation from "@/app/dashboard/components/other-info-form";
import { db } from "@/db";
import { course, user } from "@/db/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { FaHome } from "react-icons/fa";

export const metadata = {
  title: "Other Info",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const OtherPage = async ({ params }: { params: { slug: string } }) => {
  const userSession = await getUserSessionRedis();
  if (!userSession) {
    return redirect("/");
  }
  const batchResponse = await db.batch([
    db.query.course.findFirst({
      where: eq(course.slug, params.slug as string),
      with: {
        courseCategory: true,
      },
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
      <div className="flex items-center my-5 gap-2">
        <Link className="flex  ease-in items-center gap-3" href="/dashboard">
          <FaHome />
          Home &gt;
        </Link>

        <div>
          <Link href={`/dashboard/courses/${courseInfo.slug}/basic`}>
            {courseInfo.title} &gt;
          </Link>
        </div>
        <Link
          className="border-b-2 border-black"
          href={`/dashboard/courses/${courseInfo.slug}/other`}
        >
          Other Info
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
        currentCategory={courseInfo.courseCategory}
        validity={courseInfo.validity}
        update
      />
    </section>
  );
};

export default OtherPage;
