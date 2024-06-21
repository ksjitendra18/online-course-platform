import { db } from "@/db";
import { chapter, course, courseProgress } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    const publishedChapters = await db.query.chapter.findMany({
      where: eq(chapter.courseId, courseId),
      columns: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const completedChapters = await db
      .select({ count: count(courseProgress.id) })
      .from(courseProgress)
      .where(
        and(
          eq(courseProgress.userId, userId),
          inArray(courseProgress.chapterId, publishedChapterIds),
          eq(courseProgress.isCompleted, true)
        )
      );

    const progressPercentage =
      (completedChapters[0].count / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("error while fetching progesss", error);
    return 0;
  }
};
