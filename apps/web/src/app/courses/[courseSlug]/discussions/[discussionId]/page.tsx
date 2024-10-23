import { redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseData } from "@/db/queries/courses";
import { courseEnrollment, discussion } from "@/db/schema";
import { formatDate } from "@/lib/utils";

import AddNewReply from "../_components/add-new-reply";
import UpvoteBtn from "../_components/upvote-btn";

export const metadata = {
  title: "Discussion",
};

const DiscussionIdPage = async (props: {
  params: Promise<{ courseSlug: string; discussionId: string }>;
}) => {
  const params = await props.params;

  const courseData = await getCourseData({ courseSlug: params.courseSlug });

  const discussionInfo = await db.query.discussion.findFirst({
    where: eq(discussion.id, params.discussionId),
    with: {
      answers: {
        with: {
          user: true,
        },
      },
      user: {
        columns: { name: true },
      },
      votes: true,
    },
  });

  const userSession = await getUserSessionRedis();

  if (!discussionInfo || !courseData || !userSession) {
    redirect(`/courses/${params.courseSlug}`);
  }

  const isInstructor = discussionInfo.courseId === courseData.id;

  const userHasUpvoted = !!discussionInfo?.votes.find(
    (vote) => vote.userId === userSession?.userId
  );

  const isEnrolled = await db.query.courseEnrollment.findFirst({
    where: and(
      eq(courseEnrollment.courseId, courseData.id),
      eq(courseEnrollment.userId, userSession.userId)
    ),
  });

  if (!isInstructor) {
    if (!isEnrolled) {
      return redirect(`/courses/${params.courseSlug}`);
    }
  }
  return (
    <div className="my-6 px-6">
      <section>
        <h2 className="text-3xl font-bold">{discussionInfo.question}</h2>
        <div className="mb-3 mt-1 flex items-center gap-5">
          <p>{formatDate(discussionInfo.createdAt!)}</p>

          <span> &#x25CF; By {discussionInfo.user.name}</span>
          <UpvoteBtn
            discussionId={discussionInfo.id}
            userHasVoted={userHasUpvoted}
            votes={
              discussionInfo.votes.length > 0
                ? discussionInfo.votes[0].upvotes
                : 0
            }
          />
        </div>

        <div className="mb-3 rounded-md bg-white px-3 py-2">
          {discussionInfo.description}
        </div>
      </section>

      <AddNewReply
        discussionId={discussionInfo.id}
        numberOfReplies={discussionInfo.answers.length}
      />
      {discussionInfo.answers.length > 0 && (
        <section className="flex flex-col gap-5">
          {discussionInfo.answers.map((reply) => (
            <div className="rounded-md bg-white px-3 py-2" key={reply.id}>
              <h3>
                <span className="mr-1 font-semibold">{reply.user.name}</span>
                {isInstructor && (
                  <span className="rounded-md bg-emerald-600 px-2 py-1 text-sm text-white">
                    Instructor
                  </span>
                )}
              </h3>
              <p className="mb-1 text-sm text-gray-600">
                {formatDate(reply.createdAt!)}
              </p>
              <div className="">{reply.reply}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default DiscussionIdPage;
