import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData } from "@/db/queries/courses";
import { getDiscountedPrice } from "@/db/queries/discount";
import {
  CourseEnrollment,
  Purchase,
  chapter,
  courseEnrollment,
  purchase,
  videoData,
} from "@/db/schema";
import { capitalizeFirstWord, formatDuration } from "@/lib/utils";

import BuyCourse from "../_components/buy-course";
import CourseSidebar from "../_components/course-sidebar";
import EnrollCourse from "../_components/enroll-course";
import ReviewDialog from "../_components/review-dialog";
import ApplyDiscount from "./apply-discount";
import ShowDiscountCode from "./show-discount-code";

export async function generateMetadata(props: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const courseData = await getCourseData({ courseSlug: params.courseSlug });

  return {
    title: courseData?.title,
  };
}

const CoursePage = async (props: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
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
      const videoCount = await tx.$count(
        chapter,
        and(eq(chapter.courseId, courseData.id), eq(chapter.type, "video"))
      );

      const videoDuration = await tx
        .select({ duration: videoData.duration })
        .from(videoData)
        .where(eq(videoData.courseId, courseData.id));

      const quizCount = await tx.$count(
        chapter,
        and(eq(chapter.courseId, courseData.id), eq(chapter.type, "quiz"))
      );

      return {
        videosCount: videoCount,
        quizzesCount: quizCount,
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

  const discountCode = Array.isArray(searchParams.discountCode)
    ? searchParams.discountCode[0]
    : searchParams.discountCode;

  const { newPrice, discountData } = await getDiscountedPrice({
    courseId: courseData.id,
    code: discountCode,
  });

  return (
    <div className="flex flex-col-reverse md:flex-row">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={!!isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        userHasEnrolled={!!userHasEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="mx-auto mt-5 w-full md:px-4">
        <div className="bg-[#213147] px-4 py-5 text-white md:rounded-md md:px-7">
          <h2 className="text-center text-2xl font-bold md:text-left md:text-3xl">
            {courseData.title}
          </h2>
          <p className="mt-5">{courseData.description}</p>

          {!courseData.isFree && !userHasEnrolled ? (
            <>
              {discountData ? (
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="flex items-center gap-2">
                    <p className="my-3 text-2xl font-bold">₹{newPrice}</p>
                    <p className="my-3 text-2xl font-bold text-gray-200 line-through">
                      ₹{courseData.price}
                    </p>
                  </div>

                  <ShowDiscountCode code={discountData.code} />
                </div>
              ) : (
                <div className="flex items-center gap-3 md:gap-6">
                  <p className="my-3 text-2xl font-bold">₹{courseData.price}</p>
                </div>
              )}
            </>
          ) : null}

          <div className="my-5 flex flex-col items-center gap-5 md:flex-row">
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
                      <>
                        <BuyCourse
                          courseId={courseData.id}
                          email={userSession.email}
                          userName={userSession.name}
                          userId={userSession.userId}
                          coursePrice={newPrice}
                          discountCode={discountCode}
                        />
                        <ApplyDiscount
                          price={courseData.price!}
                          courseId={courseData.id}
                        />
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Button variant="app" asChild>
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      `/courses/${params.courseSlug}`
                    )}`}
                  >
                    Buy Now
                  </Link>
                </Button>
                <ApplyDiscount
                  price={courseData.price!}
                  courseId={courseData.id}
                />
              </>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 items-center gap-8 md:grid-cols-5">
            <p className="rounded-md bg-white/20 p-1 backdrop-blur-md">
              Level: {capitalizeFirstWord(courseData.level)}
            </p>

            <p className="rounded-md bg-white/20 p-1 backdrop-blur-md">
              {courseData.courseModule.length} Modules
            </p>
            <p className="rounded-md bg-white/20 p-1 backdrop-blur-md">
              {videosCount} Videos
            </p>
            {totalDuration > 0 && (
              <p className="rounded-md bg-white/20 p-1 backdrop-blur-md">
                {formatDuration(totalDuration)}
              </p>
            )}
            <p className="rounded-md bg-white/20 p-1 backdrop-blur-md">
              {quizzesCount} Quiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
