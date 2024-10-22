import Link from "next/link";
import { redirect } from "next/navigation";

import { FaHome } from "react-icons/fa";

import BasicInformation from "@/app/dashboard/components/basic-info-form";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseInfo } from "@/db/queries/courses";

export const metadata = {
  title: "Basic Info",
};

const BasicPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;

  const userInfo = await getUserSessionRedis();

  if (!userInfo) {
    return redirect("/");
  }

  const courseInfo = await getCourseInfo(params.slug, userInfo.userId);

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
        </div>{" "}
        <Link
          className="border-b-2 border-black"
          href={`/dashboard/courses/${courseInfo.slug}/basic`}
        >
          Basic Info
        </Link>
      </div>

      <div className="flex items-center justify-between gap-x-3 md:justify-start">
        <h1 className="my-3 text-2xl font-bold">Edit Course Details</h1>
      </div>
      <BasicInformation
        courseSlug={courseInfo.slug}
        courseId={courseInfo.id}
        courseName={courseInfo.title}
        courseDescription={courseInfo.description}
        isFree={courseInfo.isFree}
        update={true}
      />
    </section>
  );
};

export default BasicPage;
