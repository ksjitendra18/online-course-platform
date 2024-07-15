import { db } from "@/db";
import { session, user } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { decryptCookie } from "@/lib/cookies";
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
    const { isAuth, userInfo } = await checkAuth();
    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
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
