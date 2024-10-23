import { redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";

import AddNewReply from "@/app/courses/[courseSlug]/discussions/_components/add-new-reply";
import UpvoteBtn from "@/app/courses/[courseSlug]/discussions/_components/upvote-btn";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getCourseInfo } from "@/db/queries/courses";
import { courseEnrollment, discussion } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Discussion",
};

const DiscussionIdPage = async (props: {
  params: Promise<{ slug: string; discussionId: string }>;
}) => {
  const params = await props.params;
  const userSession = await getUserSessionRedis();

  if (!userSession) {
    return redirect("/dashboard/courses");
  }
  const courseData = await getCourseInfo(params.slug, userSession.userId);
  const discussionInfo = await db.query.discussion.findFirst({
    where: eq(discussion.id, params.discussionId),
    with: {
      course: {
        columns: { id: true },
      },
      answers: {
        with: {
          user: {
            columns: { name: true },
          },
        },
      },
      user: {
        columns: { name: true },
      },
      votes: true,
    },
  });

  if (!discussionInfo || !courseData || !userSession) {
    redirect("/");
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

  // TODO: FIX ALLOW UPVOTE AND COMMENTS FROM ENROLLED

  if (!isInstructor) {
    return redirect(`/courses/${params.slug}`);
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

      {isEnrolled && (
        <AddNewReply
          discussionId={discussionInfo.id}
          numberOfReplies={discussionInfo.answers.length}
        />
      )}
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
              <div className="flex items-center gap-3">
                {/* {isInstructor && (
                  <span className="bg-emerald-600 text-sm text-white px-2 rounded-md py-1">
                    Instructor
                  </span>
                )} */}
                <p className="mb-1 text-sm text-gray-600">
                  {formatDate(reply.createdAt!)}
                </p>
              </div>
              <div className="">{reply.reply}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default DiscussionIdPage;
