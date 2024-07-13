import { db } from "@/db";
import { chapter } from "@/db/schema";
import redis from "@/lib/redis";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const cachedData = await redis.get("basics-of-jsx");

    console.log("cachedData", !!cachedData);
    if (cachedData) {
      return Response.json(JSON.parse(cachedData));
    }
    const data = await db.query.chapter.findFirst({
      where: and(
        eq(chapter.slug, "basics-of-jsx"),
        eq(chapter.courseId, "f1jid0g6fjcqxa6s6dd2d2hq")
      ),
      columns: {
        id: true,
        title: true,
        description: true,
        isFree: true,
        type: true,
        slug: true,
      },
      with: {
        courseModule: {
          columns: {
            title: true,
            slug: true,
          },
        },
        videoData: true,
        quiz: {
          with: {
            questions: {
              with: {
                answers: true,
              },
            },
          },
        },
      },
    });

    redis.set("basics-of-jsx", JSON.stringify(data), "EX", 600);

    return Response.json(data);
  } catch (error) {
    console.log("error", error);
    return Response.json(
      {
        error: {
          code: "server_error",
          message: "Internal Server Error. Please try again",
        },
      },
      { status: 500 }
    );
  }
}
