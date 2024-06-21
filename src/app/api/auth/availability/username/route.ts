import { db } from "@/db";
import { user } from "@/db/schema";
import { UsernameSchema } from "@/validations/username";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const {
    userName,
  }: {
    userName: string;
  } = await request.json();

  try {
    const parsedData = UsernameSchema.safeParse(userName);

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

    const userNameExists = await db.query.user.findFirst({
      columns: {
        userName: true,
      },
      where: eq(user.userName, parsedData.data),
    });

    if (userNameExists) {
      return Response.json(
        {
          available: false,
          error: {
            code: "username_exists",
            message: "Username already exists.",
          },
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          available: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("Error while checking username", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
