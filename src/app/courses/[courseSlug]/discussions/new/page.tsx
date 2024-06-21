import { getCourseData } from "@/db/queries/courses";
import { customAlphabet } from "nanoid";
import NewDiscussionForm from "../_components/new-discussion-form";
import { redirect } from "next/navigation";
import { getUserSessionRedis } from "@/db/queries/auth";

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
    <div className=" my-6 px-6   h-full w-full">
      <h2 className="text-3xl text-center font-bold">New Question</h2>

      <section className="my-10  ">
        <NewDiscussionForm
          courseSlug={params.courseSlug}
          courseId={courseData.id}
        />
      </section>
    </div>
  );
};

export default AddNewDiscussion;
