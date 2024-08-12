import { db } from "@/db";
import { chapter, courseModule, courseProgress } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const getProgress = async (userId: string, courseId: string) => {
  try {
    const publishedModulesWithChapters = await db.query.courseModule.findMany({
      where: and(
        eq(courseModule.status, "published"),
        eq(courseModule.courseId, courseId)
      ),
      columns: {
        id: true,
      },
      with: {
        chapter: {
          where: eq(chapter.status, "published"),
          columns: {
            id: true,
          },
        },
      },
    });

    const publishedChapterIds = publishedModulesWithChapters.reduce(
      (acc, module) => {
        return acc.concat(module.chapter.map((chapter) => chapter.id));
      },
      [] as string[]
    );

    const completedChapters = await db.query.courseProgress.findMany({
      where: and(
        eq(courseProgress.userId, userId),
        inArray(courseProgress.chapterId, publishedChapterIds)
      ),
      columns: {
        chapterId: true,
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
