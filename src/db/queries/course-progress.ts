import { db } from "@/db";
import { chapter, course, courseProgress } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export const getProgress = async (userId: string, courseId: string) => {
  try {
    const publishedChapters = await db.query.chapter.findMany({
      where: eq(chapter.courseId, courseId),
      columns: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const completedChapters = await db.query.courseProgress.findMany({
      where: and(
        eq(courseProgress.userId, userId),
        inArray(courseProgress.chapterId, publishedChapterIds),
        eq(courseProgress.isCompleted, true)
      ),
      columns: {
        id: true,
      },
    });

    const progressPercentage =
      (completedChapters.length / publishedChapterIds.length) * 100;

    return { progressPercentage, completedChapters: completedChapters };
  } catch (error) {
    console.log("error while fetching progesss", error);
    return { progessPercentage: 0, completedChapters: [] };
  }
};
