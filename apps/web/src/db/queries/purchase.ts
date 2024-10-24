import { unstable_cache } from "next/cache";

import { and, eq } from "drizzle-orm";

import { db } from "..";
import { purchase } from "../schema";

export const getPurchaseInfo = unstable_cache(
  async ({ userId, courseId }: { userId: string; courseId: string }) => {
    return await db.query.purchase.findFirst({
      columns: { id: true },
      where: and(eq(purchase.courseId, courseId), eq(purchase.userId, userId)),
    });
  },
  ["get-purchase-info"],
  { revalidate: 7200, tags: ["get-purchase-info"] }
);
