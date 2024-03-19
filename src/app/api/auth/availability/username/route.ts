import { db } from "@/db";
import { organization, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const {
    username,
  }: {
    username: string;
  } = await request.json();

  if (!username || username.length < 1) {
    return Response.json(
      {
        error: "validation_error",
        message: "username is required",
        missing: ["username"],
      },
      { status: 400 }
    );
  }

  try {
    const userInfo = await db.query.user.findFirst({
      where: eq(user.userName, username),
    });

    if (userInfo) {
      return Response.json(
        {
          error: "username_already_exist",
          message: "Username already exist. Please try another one",
        },
        { status: 409 }
      );
    }

    return Response.json({
      isAvailable: true,
    });
  } catch (error) {
    return Response.json(
      {
        error: "server_error",
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
