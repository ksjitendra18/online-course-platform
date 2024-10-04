import Link from "next/link";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { FaHome } from "react-icons/fa";

import OtherInformation from "@/app/dashboard/components/other-info-form";
import PublishCourse from "@/app/dashboard/components/publish-course";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { course, user } from "@/db/schema";

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
    <section className="w-full px-6 py-3">
      <div className="my-5 flex items-center gap-2">
        <Link className="flex items-center gap-3 ease-in" href="/dashboard">
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

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">Edit Course Details</h1>
        {courseInfo.status === "published" ? null : (
          <PublishCourse
            triggerMsg="Publish Course"
            courseId={courseInfo.id}
            variant={"app"}
          />
        )}
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
        existingCategories={courseInfo.courseCategory.map(
          (category) => category.categoryId
        )}
      />
    </section>
  );
};

export default OtherPage;
