import { unstable_cache } from "next/cache";

import { and, eq, inArray, like, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  chapter,
  course,
  courseEnrollment,
  courseMember,
  courseModule,
  videoData,
} from "@/db/schema";

export const getCourseInfo = unstable_cache(
  async (slug: string, userId: string) => {
    return await db.query.course.findFirst({
      columns: {
        id: true,
        title: true,
        slug: true,
        status: true,
        description: true,
        isFree: true,
      },
      where: and(
        eq(course.slug, slug),
        inArray(
          course.id,
          db
            .select({ id: courseMember.courseId })
            .from(courseMember)
            .where(eq(courseMember.userId, userId))
        )
      ),
    });
  },
  ["get-course-info"],
  { revalidate: 7200, tags: ["get-course-info"] }
);

type GetCourseDataParams = {
  courseSlug: string;
  userId?: string;
};

export const getCourseData = unstable_cache(
  async ({ courseSlug }: GetCourseDataParams) => {
    return await db.query.course.findFirst({
      where: eq(course.slug, courseSlug),
      columns: {
        id: true,
        title: true,
        isFree: true,
        slug: true,
        imageUrl: true,
        description: true,
        price: true,
        level: true,
      },
      with: {
        courseMember: true,
        courseModule: {
          where: eq(courseModule.status, "published"),
          columns: {
            title: true,
            id: true,
            slug: true,
          },
          orderBy: courseModule.position,
          with: {
            chapter: {
              where: eq(courseModule.status, "published"),
              columns: {
                id: true,
                title: true,
                isFree: true,
                slug: true,
                type: true,
              },
              // with: {
              //   progress: {
              //     where: eq(courseProgress.userId, userId ?? ""),
              //   },
              // },
              orderBy: chapter.position,
            },
          },
        },
      },
    });
  },
  ["get-course-data"],
  { revalidate: 7200, tags: ["get-course-data"] }
);

export const getAllCoursesByUserId = unstable_cache(
  async (userId: string, search?: string) => {
    return await db.query.courseMember.findMany({
      where: and(
        eq(courseMember.userId, userId),
        inArray(
          courseMember.courseId,
          db
            .select({ id: course.id })
            .from(course)
            .where(like(course.title, `%${search ? search : ""}%`))
        )
      ),
      with: {
        course: {
          with: {
            courseModule: {
              where: eq(courseModule.status, "published"),
              columns: {
                id: true,
              },
            },
          },
          columns: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            isFree: true,
            price: true,
            validity: true,
          },
        },
      },
    });
  },
  ["get-all-courses-admin"],
  { revalidate: 7200, tags: ["get-all-courses-admin"] }
);
export const getDynamicCoursesByUserId = async (
  userId: string,
  search?: string
) => {
  return unstable_cache(
    async () => {
      return await db.query.courseMember.findMany({
        where: and(
          eq(courseMember.userId, userId),
          inArray(
            courseMember.courseId,
            db
              .select({ id: course.id })
              .from(course)
              .where(like(course.title, `%${search ? search : ""}%`))
          )
        ),
        with: {
          course: {
            with: {
              courseModule: {
                columns: {
                  id: true,
                },
              },
            },
            columns: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              isFree: true,
              price: true,
              validity: true,
            },
          },
        },
      });
    },
    [`get-all-courses-admin-${userId}`],
    { revalidate: 7200, tags: [`get-all-courses-admin-${userId}`] }
  );
};

export const getEnrolledCourses = unstable_cache(
  async (userId: string) => {
    return await db.query.courseEnrollment.findMany({
      where: eq(courseEnrollment.userId, userId),
      columns: { id: true, createdAt: true },
      with: {
        course: {
          columns: {
            id: true,
            title: true,
            slug: true,
            validity: true,
            imageUrl: true,
          },
        },
      },
    });
  },

  ["get-enrolled-courses"],
  { revalidate: 7200, tags: ["get-enrolled-courses"] }
);

export const getAdminPublishedCoursesLength = unstable_cache(
  async (userId: string) => {
    return await db.$count(
      course,
      and(
        eq(course.status, "published"),
        inArray(
          course.id,
          db
            .select({ id: courseMember.courseId })
            .from(courseMember)
            .where(eq(courseMember.userId, userId))
        )
      )
    );
  },
  ["get-admin-published-course-length"],
  { revalidate: 7200, tags: ["get-admin-published-course-length"] }
);

export const getPublishedCourses = unstable_cache(
  async (search?: string) => {
    return await db.query.course.findMany({
      columns: {
        id: true,
        title: true,
        imageUrl: true,
        price: true,
        isFree: true,
        slug: true,
      },
      where: and(
        eq(course.status, "published"),
        like(course.title, `%${search ? search : ""}%`)
      ),

      with: {
        courseModule: {
          columns: {
            id: true,
          },
        },
      },
    });
  },

  ["get-published-course"],
  { revalidate: 7200, tags: ["get-published-courses"] }
);

export const getTotalEnrollments = unstable_cache(
  async (userId: string) => {
    return await db.query.courseEnrollment.findMany({
      columns: {
        id: true,
      },
      where: inArray(
        courseEnrollment.courseId,
        db
          .select({ id: courseMember.courseId })
          .from(courseMember)
          .where(eq(courseMember.userId, userId))
      ),
    });
  },
  ["get-total-enrollments"],
  { revalidate: 7200, tags: ["get-total-enrollments"] }
);

export const getCourseMetaData = unstable_cache(
  async (courseId: string) => {
    return await db.transaction(async (tx) => {
      const videoCount = await tx.$count(
        chapter,
        and(eq(chapter.courseId, courseId), eq(chapter.type, "video"))
      );

      const videoDuration = await tx
        .select({ duration: sum(videoData.duration) })
        .from(videoData)
        .where(eq(videoData.courseId, courseId));

      const quizCount = await tx.$count(
        chapter,
        and(eq(chapter.courseId, courseId), eq(chapter.type, "quiz"))
      );

      return {
        videosCount: videoCount,
        quizzesCount: quizCount,
        videoDuration: videoDuration[0].duration ?? "0",
      };
    });
  },
  ["get-course-metadata"],
  { revalidate: 7200, tags: ["get-course-metadata"] }
);
