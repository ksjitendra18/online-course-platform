import { db } from "@/db";
import { session, user } from "@/db/schema";
import { ProfileSchema } from "@/validations/profile";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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

    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
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
      .where(eq(user.id, sessionExists.user.id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updating profile", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
