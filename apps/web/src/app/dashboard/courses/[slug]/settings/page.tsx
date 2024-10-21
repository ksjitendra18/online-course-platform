import { redirect } from "next/navigation";
import React from "react";

import { AlertTriangle } from "lucide-react";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseInfo } from "@/db/queries/courses";

import DeleteCourse from "./_components/delete-course";

export const metadata = {
  title: "Settings",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const SettingsPage = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;
  const userInfo = await getUserSessionRedis();

  if (!userInfo) {
    return redirect("/dashboard");
  }
  const courseData = await getCourseInfo(params.slug, userInfo.userId);
  if (!courseData) {
    return redirect("/dashboard");
  }
  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="mx-auto flex flex-col items-center rounded-md bg-white px-4 py-3 pb-5 md:w-1/2">
        <h2 className="text-xl font-bold">Delete Course</h2>

        <p className="mt-3 flex items-center rounded-md bg-red-600 px-2 py-3 text-white">
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
