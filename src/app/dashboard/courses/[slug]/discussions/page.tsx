import { getCourseInfo } from "@/db/queries/courses";
import { getDiscussions } from "@/db/queries/discussions";
import { redirect } from "next/navigation";

import { getUserSessionRedis } from "@/db/queries/auth";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { CircleArrowUp, MessageSquareText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Discussions",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const DiscussionsPage = async ({ params }: { params: { slug: string } }) => {
  const userSession = await getUserSessionRedis();

  if (!userSession) {
    return redirect(`/dashboard/courses`);
  }
  const courseData = await getCourseInfo(params.slug, userSession.userId);

  if (!courseData) {
    return redirect(`/dashboard/courses`);
  }
  const allDiscussions = await getDiscussions(courseData.id);

  return (
    <div className="my-6 px-6 h-full w-full">
      <section className="flex items-center gap-5">
        <h2 className="text-2xl font-bold">Discussions</h2>

        <Button variant="app" asChild>
          <Link href={`/courses/${params.slug}/discussions/new`}>
            Add new Question
          </Link>
        </Button>
      </section>

      <section className="my-10 grid   grid-cols-2 grid-rows-2 gap-7 ">
        {allDiscussions && allDiscussions.length > 0 ? (
          <>
            {allDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                className="px-6 shadow-md flex justify-between  py-4 rounded-md bg-white  duration-100 ease-in transition-all"
                href={`/dashboard/courses/${params.slug}/discussions/${discussion.id}`}
              >
                <div className="flex-1 min-w-[1px]">
                  <h3 className="font-bold text-xl">{discussion.question}</h3>
                  <div className="flex items-center gap-5 mt-1 mb-3">
                    <p>{formatDate(discussion.createdAt!)}</p>

                    <span> &#x25CF; By {discussion.user.name}</span>
                  </div>

                  <p className="truncate">{discussion.description}</p>
                </div>
                <div className="flex gap-3 flex-col">
                  <div className="flex gap-1 items-center">
                    <span className="flex-1">
                      {" "}
                      {discussion.votes.length > 0
                        ? discussion.votes[0].upvotes
                        : 0}
                    </span>
                    <CircleArrowUp className="flex-1" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="flex-1">{discussion.answers.length}</span>
                    <MessageSquareText className="flex-1" />
                  </div>
                </div>
              </Link>
            ))}
          </>
        ) : (
          <>
            <p className="text-xl font-bold text-center my-5">
              No questions yet!
            </p>
          </>
        )}
      </section>
    </div>
  );
};

export default DiscussionsPage;
