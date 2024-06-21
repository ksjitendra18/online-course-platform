import { db } from "@/db";
import { course, discussion, discussionReply, session } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { discussionId, reply } = await request.json();

  try {
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

    const discussionExists = await db.query.discussion.findFirst({
      columns: { id: true },
      where: eq(discussion.id, discussionId),
    });

    if (!discussionExists) {
      return Response.json(
        {
          error: {
            code: "invalid_discussion_id",
            message: "Please enter a valid discussion ID",
          },
        },
        { status: 404 }
      );
    }

    await db.insert(discussionReply).values({
      discussionId,
      reply,
      userId: sessionExists.user.id,
    });
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while reply", error);

    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
