import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getUserSessionRedis } from "@/db/queries/auth";
import { getProgress } from "@/db/queries/course-progress";
import { getCourseData, getCourseMetaData } from "@/db/queries/courses";
import { getDiscountedPrice } from "@/db/queries/discount";
import { getEnrollmentStatus } from "@/db/queries/enrollment";
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

  const { videosCount, quizzesCount, videoDuration } = await getCourseMetaData(
    courseData.id
  );

  let completedChapterIds: string[] = [];
  // let purchaseInfo: Partial<Purchase> | undefined;
  // let isEnrolled: CourseEnrollment | undefined;

  let isEnrolled: boolean = false;
  let isPartOfCourse;
  let progressCount = 0;

  if (userSession) {
    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );

    isEnrolled = await getEnrollmentStatus({
      courseId: courseData.id,
      userId: userSession.userId,
    });

    if (isEnrolled) {
      const progressData = await getProgress(userSession.userId, courseData.id);
      completedChapterIds = progressData.completedChapters.map(
        (chapter) => chapter.chapterId
      );
      progressCount = progressData.progressPercentage ?? 0;
    }
  }

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
        chapterSlug=""
        moduleSlug=""
        progressCount={progressCount}
        isEnrolled={!!isEnrolled}
        completedChapterIds={completedChapterIds}
      />
      <div className="mx-auto mt-5 w-full md:px-4">
        <div className="bg-[#213147] px-4 py-5 text-white md:rounded-md md:px-7">
          <h2 className="text-center text-2xl font-bold md:text-left md:text-3xl">
            {courseData.title}
          </h2>
          <p className="mt-5">{courseData.description}</p>

          {!courseData.isFree && !isEnrolled ? (
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

          <div className="my-5 flex items-center gap-5 md:flex-row">
            {userSession ? (
              <>
                {isEnrolled || isPartOfCourse ? (
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
            <p className="rounded-md bg-white/20 p-1 px-3 backdrop-blur-md">
              Level: {capitalizeFirstWord(courseData.level)}
            </p>

            <p className="rounded-md bg-white/20 p-1 px-3 backdrop-blur-md">
              {courseData.courseModule.length} Modules
            </p>
            <p className="rounded-md bg-white/20 p-1 px-3 backdrop-blur-md">
              {videosCount} Videos
            </p>
            {parseInt(videoDuration) > 0 && (
              <p className="rounded-md bg-white/20 p-1 px-3 backdrop-blur-md">
                {formatDuration(parseInt(videoDuration))}
              </p>
            )}
            <p className="rounded-md bg-white/20 p-1 px-3 backdrop-blur-md">
              {quizzesCount} Quiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
