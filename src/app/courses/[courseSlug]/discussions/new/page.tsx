import { redirect } from "next/navigation";

import { customAlphabet } from "nanoid";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseData } from "@/db/queries/courses";

import NewDiscussionForm from "../_components/new-discussion-form";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const AddNewDiscussion = async ({
  params,
}: {
  params: { courseSlug: string };
}) => {
  const userSession = await getUserSessionRedis();

  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  if (!courseData) {
    redirect("/");
  }
  return (
    <div className="my-6 h-full w-full px-6">
      <h2 className="text-center text-3xl font-bold">New Question</h2>

      <section className="my-10">
        <NewDiscussionForm
          courseSlug={params.courseSlug}
          courseId={courseData.id}
        />
      </section>
    </div>
  );
};

export default AddNewDiscussion;
