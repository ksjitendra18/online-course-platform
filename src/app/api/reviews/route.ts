import { eq } from "drizzle-orm";
import { course, courseMember, review, session } from "@/db/schema";
import { BasicInfoSchema } from "@/validations/basic-info";
import { cookies } from "next/headers";
import { db } from "@/db";
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

    // check if user is valid
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      where: eq(session.id, token),
      columns: { id: true },
      with: {
        user: {
          columns: { id: true },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    await db.insert(review).values({
      courseId: parsedData.data.courseId,
      rating: parsedData.data.rating,
      userId: sessionExists.user.id,
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
