import Link from "next/link";
import { redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";
import { CircleArrowUp, MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseData } from "@/db/queries/courses";
import { getDiscussions } from "@/db/queries/discussions";
import { courseEnrollment, courseMember } from "@/db/schema";
import { formatDate } from "@/lib/utils";

const DiscussionPage = async (props: {
  params: Promise<{ courseSlug: string }>;
}) => {
  const params = await props.params;
  const userSession = await getUserSessionRedis();
  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  if (!courseData || !userSession) {
    redirect("/");
  }

  const isEnrolled = await db.query.courseEnrollment.findFirst({
    where: and(
      eq(courseEnrollment.courseId, courseData.id),
      eq(courseEnrollment.userId, userSession.userId)
    ),
  });

  const isInstructor = await db.query.courseMember.findFirst({
    where: eq(courseMember.courseId, courseData.id),
  });

  if (!isInstructor) {
    if (!isEnrolled) {
      return redirect(`/courses/${params.courseSlug}`);
    }
  }

  const allDiscussions = await getDiscussions(courseData.id);
  return (
    <div className="my-6 h-full w-full px-6">
      <section className="flex items-center gap-5">
        <h2 className="text-3xl font-bold">Discussions</h2>

        <Button variant="app" asChild>
          <Link href={`/courses/${params.courseSlug}/discussions/new`}>
            Add new Question
          </Link>
        </Button>
      </section>

      <section className="my-10 grid grid-cols-2 grid-rows-2 gap-7">
        {allDiscussions && allDiscussions.length > 0 ? (
          <>
            {allDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                className="flex justify-between rounded-md bg-white px-6 py-4 shadow-md transition-all duration-100 ease-in"
                href={`/courses/${params.courseSlug}/discussions/${discussion.id}`}
              >
                <div className="min-w-[1px] flex-1">
                  <h3 className="text-xl font-bold">{discussion.question}</h3>
                  <div className="mb-3 mt-1 flex items-center gap-5">
                    <p>{formatDate(discussion.createdAt!)}</p>

                    <span> &#x25CF; By {discussion.user.name}</span>
                  </div>

                  <p className="truncate">{discussion.description}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1">
                    <span className="flex-1">
                      {" "}
                      {discussion.votes.length > 0
                        ? discussion.votes[0].upvotes
                        : 0}
                    </span>
                    <CircleArrowUp className="flex-1" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="flex-1">{discussion.answers.length}</span>
                    <MessageSquareText className="flex-1" />
                  </div>
                </div>
              </Link>
            ))}
          </>
        ) : (
          <>
            <p className="my-5 text-center text-xl font-bold">
              No questions yet!
            </p>
          </>
        )}
      </section>
    </div>
  );
};

export default DiscussionPage;
