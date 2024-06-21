// TODO: IMPLEMENT PAGINATION

import { db } from "@/db";
import { discussion } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getDiscussions = unstable_cache(
  async (courseId: string) => {
    if (!courseId) {
      return null;
    }

    const allDiscussions = await db.query.discussion.findMany({
      where: eq(discussion.courseId, courseId),
      orderBy: desc(discussion.createdAt),
      columns: { id: true, question: true, description: true, createdAt: true },
      with: {
        answers: {
          columns: {
            id: true,
          },
        },
        user: {
          columns: {
            name: true,
          },
        },
        votes: {
          columns: { upvotes: true },
        },
      },
    });

    return allDiscussions;
  },
  ["get-all-discussions"],
  { revalidate: 7200, tags: ["get-all-discussions"] }
);
