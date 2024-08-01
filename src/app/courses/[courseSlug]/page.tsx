import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import {
  CourseEnrollment,
  Purchase,
  chapter,
  courseEnrollment,
  purchase,
  videoData,
} from "@/db/schema";
import { capitalizeFirstWord, formatDuration } from "@/lib/utils";
import { and, count, eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BuyCourse from "../_components/buy-course";
import CourseSidebar from "../_components/course-sidebar";
import EnrollCourse from "../_components/enroll-course";
import ReviewDialog from "../_components/review-dialog";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { courseSlug: string };
}): Promise<Metadata> {
  const courseData = await getCourseData({ courseSlug: params.courseSlug });

  return {
    title: courseData?.title,
  };
}

const CoursePage = async ({ params }: { params: { courseSlug: string } }) => {
  const userSession = await getUserSessionRedis();

  const courseData = await getCourseData({
    courseSlug: params.courseSlug,
    userId: userSession?.userId,
  });

  if (!courseData) {
    return redirect("/");
  }

  const { videosCount, quizzesCount, videoDuration } = await db.transaction(
    async (tx) => {
      const videoCount = await tx
        .select({ count: count(chapter.id) })
        .from(chapter)
        .where(
          and(eq(chapter.courseId, courseData.id), eq(chapter.type, "video"))
        );

      const videoDuration = await tx
        .select({ duration: videoData.duration })
        .from(videoData)
        .where(eq(videoData.courseId, courseData.id));

      const quizCount = await tx
        .select({ count: count(chapter.id) })
        .from(chapter)
        .where(
          and(eq(chapter.courseId, courseData.id), eq(chapter.type, "quiz"))
        );

      return {
        videosCount: videoCount[0].count,
        quizzesCount: quizCount[0].count,
        videoDuration,
      };
    }
  );

  let completedChapterIds: string[] = [];
  let purchaseInfo: Purchase | undefined;
  let isPartOfCourse;
  let userHasEnrolled: CourseEnrollment | undefined;
  let progressCount = 0;

  if (userSession) {
    purchaseInfo = await db.query.purchase.findFirst({
      where: and(
        eq(purchase.courseId, courseData.id),
        eq(purchase.userId, userSession.userId)
      ),
    });

    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );

    userHasEnrolled = await db.query.courseEnrollment.findFirst({
      where: and(
        eq(courseEnrollment.courseId, courseData.id),
        eq(courseEnrollment.userId, userSession.userId)
      ),
    });
    const progressData = await getProgress(userSession.userId, courseData.id);
    completedChapterIds = progressData.completedChapters.map(
      (chapter) => chapter.chapterId
    );
    progressCount = progressData.progressPercentage ?? 0;
  }

  const totalDuration = videoDuration.reduce(
    (total, video) => total + video.duration,
    0
  );

  return (
    <div className="flex ">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        userHasEnrolled={!!userHasEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="mx-auto mt-5 w-full">
        <div className="bg-[#213147]  rounded-md text-white px-7 py-5">
          <h2 className="text-3xl">{courseData.title}</h2>
          <p className="my-2">{courseData.description}</p>

          <div className="flex my-5">
            {userSession ? (
              <>
                {userHasEnrolled || isPartOfCourse ? (
                  <div className="flex items-center gap-5">
                    <Button variant="app" asChild>
                      <Link
                        href={`/courses/${courseData.slug}/${courseData.courseModule[0].slug}/${courseData.courseModule[0].chapter[0].slug}`}
                      >
                        Start Learning
                      </Link>
                    </Button>

                    {!isPartOfCourse && <ReviewDialog />}
                  </div>
                ) : (
                  <>
                    {courseData.isFree ? (
                      <EnrollCourse
                        courseId={courseData.id}
                        isFree={courseData.isFree}
                        price={courseData.price!}
                      />
                    ) : (
                      <BuyCourse
                        courseId={courseData.id}
                        email={userSession.email}
                        userName={userSession.name}
                        userId={userSession.userId}
                        coursePrice={courseData.price!}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <Button variant="app" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>

          <div className="flex mt-8 gap-8 items-center">
            <p>{capitalizeFirstWord(courseData.level)}</p>

            <p className="bg-white/20 backdrop-blur-md p-1 rounded-md">
              {courseData.courseModule.length} Modules
            </p>
            <p className="bg-white/20 backdrop-blur-md p-1 rounded-md">
              {videosCount} Videos
            </p>
            {totalDuration > 0 && (
              <p className="bg-white/20 backdrop-blur-md p-1 rounded-md">
                {formatDuration(totalDuration)}
              </p>
            )}
            <p className="bg-white/20 backdrop-blur-md p-1 rounded-md">
              {quizzesCount} Quiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
