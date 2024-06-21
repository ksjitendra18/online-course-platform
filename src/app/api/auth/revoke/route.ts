import { db } from "@/db";
import { session, user } from "@/db/schema";
import { ProfileSchema } from "@/validations/profile";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    id,
  }: {
    id: string;
  } = await request.json();

  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const sessionExists = await db.query.session.findFirst({
      columns: { id: true },
      where: eq(session.id, token),
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

    await db.delete(session).where(eq(session.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updating profile", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
