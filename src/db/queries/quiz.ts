import { unstable_cache } from "next/cache";
import { db } from "..";
import { course, quizAnswer, quizResponse } from "../schema";
import { desc, eq } from "drizzle-orm";

export const courseWithQuizData = unstable_cache(
  async (slug: string) => {
    return await db.query.course.findFirst({
      where: eq(course.slug, slug),
      columns: { id: true },
      with: {
        quizResponse: {
          orderBy: desc(quizResponse.createdAt),
          columns: { id: true, quizId: true, userId: true },
          with: {
            user: { columns: { name: true, email: true } },
            quizUserResponse: {
              with: {
                question: {
                  with: {
                    answers: {
                      where: eq(quizAnswer.isCorrect, true),
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  },
  ["quiz-data"],
  { tags: ["quiz-data"] }
);
