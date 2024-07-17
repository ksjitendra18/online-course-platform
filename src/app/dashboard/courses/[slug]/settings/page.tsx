import { getCourseInfo } from "@/db/queries/courses";
import { AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import DeleteCourse from "./_components/delete-course";
import { getUserSessionRedis } from "@/db/queries/auth";

export const metadata = {
  title: "Settings",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const SettingsPage = async ({ params }: { params: { slug: string } }) => {
  const userInfo = await getUserSessionRedis();

  if (!userInfo) {
    return redirect("/dashboard");
  }
  const courseData = await getCourseInfo(params.slug, userInfo.userId);
  if (!courseData) {
    return redirect("/dashboard");
  }
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex pb-5 bg-white flex-col px-4 py-3 rounded-md items-center mx-auto md:w-1/2">
        <h2 className="text-xl font-bold">Delete Course</h2>

        <p className="bg-red-600 mt-3 flex items-center text-white rounded-md px-2 py-3">
          <AlertTriangle className="mr-2" />
          All the data associated with this course will be deleted
        </p>

        <div className="my-5">
          <DeleteCourse courseId={courseData.id} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
