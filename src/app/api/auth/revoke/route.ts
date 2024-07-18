import { db } from "@/db";
import { session } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    console.error("Error while updating profile", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
