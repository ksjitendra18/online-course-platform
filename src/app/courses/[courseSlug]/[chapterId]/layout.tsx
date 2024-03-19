import React from "react";
import CourseSidebar from "../../_components/course-sidebar";

import getUserSession from "@/actions/getUserSession";
import { getUserSessionRedis } from "@/actions/getUserSessionRedis";
import { db } from "@/db";
import {
  Purchase,
  chapter,
  course,
  courseModule,
  purchase,
  user,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type CourseData = {
  id: string;
  title: string;
  slug: string;
  isFree: boolean;
  courseMember: {
    courseId: string;
    userId: string;
    role: "owner" | "admin" | "teacher";
  }[];
  courseModule: {
    id: string;
    title: string;
    slug: string;
    chapter: {
      id: string;
      title: string;
      isFree: boolean;
      slug: string;
    }[];
  }[];
};

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseSlug: string; chapterSlug: string; chapterId: string };
}) => {
  const courseData = await db.query.course.findFirst({
    where: eq(course.slug, params.courseSlug),
    columns: {
      id: true,
      title: true,
      isFree: true,
      slug: true,
    },
    with: {
      courseMember: true,
      courseModule: {
        columns: {
          title: true,
          id: true,
          slug: true,
        },
        orderBy: courseModule.position,
        with: {
          chapter: {
            columns: {
              id: true,
              title: true,
              isFree: true,
              slug: true,
            },
            orderBy: chapter.position,
          },
        },
      },
    },
  });

  const userSession = await getUserSessionRedis();

  if (!courseData) {
    return redirect("/");
  }

  let purchaseInfo: Purchase | undefined;
  let isPartOfCourse;

  if (userSession) {
    // const userInfo = await db.query.user.findFirst({
    //   where: eq(user.id, userSession.userId),
    // });

    purchaseInfo = await db.query.purchase.findFirst({
      where: and(
        eq(purchase.courseId, courseData.id),
        eq(purchase.userId, userSession.userId)
      ),
    });

    isPartOfCourse = courseData.courseMember.find(
      (mem) => mem.userId === userSession.userId
    );
  }

  return (
    <div className="flex lg:flex-row flex-col-reverse">
      <CourseSidebar
        courseData={courseData}
        courseSlug={params.courseSlug}
        isPartOfCourse={isPartOfCourse}
        purchaseInfo={purchaseInfo}
        chapterId={params.chapterId}
      />
      <div className="lg:pl-80 h-full w-full">{children}</div>
    </div>
  );
};

export default CourseLayout;
