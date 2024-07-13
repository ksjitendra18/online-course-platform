import { db } from "@/db";
import { session, user } from "@/db/schema";
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
    const authToken = cookies().get("auth-token")?.value;
    if (!authToken) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }

    const decryptedAuthToken = await decryptCookie(authToken);

    const sessionExists = await db.query.session.findFirst({
      columns: { id: true },
      where: eq(session.id, decryptedAuthToken),
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
