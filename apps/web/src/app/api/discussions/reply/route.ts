import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { discussion, discussionReply } from "@/db/schema";
import { checkAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { discussionId, reply } = await request.json();

  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
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
      userId: userInfo.id,
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
