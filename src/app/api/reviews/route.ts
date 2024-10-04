import { db } from "@/db";
import { review } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { ReviewSchema } from "@/validations/rating";

export async function POST(request: Request) {
  try {
    const { courseId, rating, description } = await request.json();

    const parsedData = ReviewSchema.safeParse({
      courseId,
      rating,
      description,
    });

    if (!parsedData.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedData.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    await db.insert(review).values({
      courseId: parsedData.data.courseId,
      rating: parsedData.data.rating,
      userId: userInfo.id,
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while creating new review", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Please try again" },
      },
      { status: 500 }
    );
  }
}
