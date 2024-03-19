import { db } from "@/db";
import { chapter, courseMember, session } from "@/db/schema";
import { ChapterInfoSchema } from "@/validations/chapter-info";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    moduleId,
    courseId,
    chapterSlug,
    chapterName,
    chapterDescription,
    videoUrl,
    isFree,
  } = await request.json();

  const parsedData = ChapterInfoSchema.safeParse({
    moduleId,
    courseId,
    chapterName,
    chapterSlug,
    chapterDescription,
    videoUrl,
    isFree,
  });

  if (!parsedData.success) {
    return Response.json(
      { error: "validation_error", message: parsedData.error.format() },
      { status: 400 }
    );
  }

  // check if user is valid
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    return Response.json(
      { error: "unauthenticated", message: "Login" },
      { status: 403 }
    );
  }

  const sessionExists = await db.query.session.findFirst({
    where: eq(session.id, token),
    with: {
      user: {
        with: {
          organizationMember: true,
        },
      },
    },
  });

  if (!sessionExists) {
    return Response.json(
      { error: "unathuenticated", message: "Login" },
      { status: 403 }
    );
  }

  const userOrgInfo = sessionExists.user.organizationMember.filter(
    (org) => org.role === "owner"
  );

  const courseMemberInfo = await db.query.courseMember.findFirst({
    where: and(
      eq(courseMember.courseId, courseId),
      eq(courseMember.userId, sessionExists.user.id)
    ),
    with: {
      course: true,
    },
  });

  if (!courseMemberInfo) {
    return Response.json(
      { error: "unauthorized", message: "Forbidden" },
      { status: 403 }
    );
  }

  const chapterExists = await db
    .select({ id: chapter.id })
    .from(chapter)
    .where(eq(chapter.moduleId, moduleId));

  await db.insert(chapter).values({
    moduleId: moduleId,
    position: chapterExists.length + 1,
    description: chapterDescription,
    title: chapterName,
    slug: chapterSlug,
    videoUrl,
    isFree,
  });

  return Response.json(null, { status: 201 });
}
