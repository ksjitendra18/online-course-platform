import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { course, courseEnrollment } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { env } from "@/utils/env/server";

export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const courseData = await db.query.course.findFirst({
      where: eq(course.id, courseId),
      columns: { id: true, title: true },
    });

    if (!courseData) {
      return Response.json(
        { error: { code: "invalid_course_id", message: "Invalid Course ID" } },
        { status: 400 }
      );
    }

    const userHasEnrolled = await db.query.courseEnrollment.findFirst({
      columns: { id: true },
      where: and(
        eq(courseEnrollment.courseId, courseId),
        eq(courseEnrollment.userId, userInfo.id)
      ),
    });

    if (userHasEnrolled) {
      return Response.json(
        {
          error: {
            code: "user_already_enrolled",
            message: "User is already enrolled ",
          },
        },
        { status: 400 }
      );
    }

    await db.insert(courseEnrollment).values({
      courseId,
      userId: userInfo.id,
    });

    await fetch("https://api.zeptomail.in/v1.1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${env.ZOHO_MAIL_TOKEN}`,
      },
      body: JSON.stringify({
        from: { address: "orders-donotreply@learningapp.link" },
        to: [
          {
            email_address: {
              address: userInfo.email,
            },
          },
        ],
        subject: "Enrollment Confirmation",
        htmlbody: `<h2>
        Start your learning journey
        </h2>
        <p>You have successfully enrolled in <span>${courseData.title}</span>. Begin your learning journey now.</p>
        <p>Track your progress and get involved with other learners via discussions tab.</p>

        <p>You have received this email because you have enrolled in <span>${courseData.title}</span> on LearningApp.</p>
        <p>If you think this is a mistake, please contact us at <a href="mailto:support@learningapp.link">support@learningapp.link</a>.</p>
      `,
      }),
    });

    revalidateTag("get-enrolled-courses");
    revalidateTag("get-total-enrollments");

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while enrolling into course", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
