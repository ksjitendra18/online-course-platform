import { redirect } from "next/navigation";

import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseData } from "@/db/queries/courses";

import NewDiscussionForm from "../_components/new-discussion-form";

const AddNewDiscussion = async (props: {
  params: Promise<{ courseSlug: string }>;
}) => {
  const params = await props.params;
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
