
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { ProfileSchema } from "@/validations/profile";

export async function POST(request: Request) {
  const {
    fullName,
    userName,
  }: {
    fullName: string;
    userName: string;
  } = await request.json();

  try {
    const parsedData = ProfileSchema.safeParse({
      fullName,
      userName,
    });

    if (!parsedData.success) {
      return Response.json({
        error: {
          code: "validation_error",
          message: parsedData.error.format(),
        },
      });
    }

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const userNameExists = await db.query.user.findFirst({
      where: eq(user.userName, parsedData.data.userName),
      columns: { id: true },
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
    }

    await db
      .update(user)
      .set({
        name: parsedData.data.fullName,
        userName: parsedData.data.userName,
      })
      .where(eq(user.id, userInfo.id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updating profile", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
