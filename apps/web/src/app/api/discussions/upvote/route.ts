import { NextRequest } from "next/server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { discussion, discussionVote } from "@/db/schema";
import { checkAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { discussionId } = await request.json();

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

    const existingVotes = await db.query.discussionVote.findFirst({
      where: and(eq(discussionVote.discussionId, discussionId)),
      columns: { upvotes: true },
    });

    const userExistingVotes = await db.query.discussionVote.findFirst({
      where: and(
        eq(discussionVote.discussionId, discussionId),
        eq(discussionVote.userId, userInfo.id)
      ),
    });

    if (userExistingVotes) {
      return Response.json({ success: true }, { status: 200 });
    }

    if (existingVotes) {
      await db.insert(discussionVote).values({
        discussionId,
        userId: userInfo.id,
        upvotes: existingVotes.upvotes + 1,
      });
      return Response.json({ success: true }, { status: 201 });
    } else {
      await db.insert(discussionVote).values({
        discussionId,
        userId: userInfo.id,
        upvotes: 1,
      });
      return Response.json({ success: true }, { status: 201 });
    }
  } catch (error) {
    console.log("error while upvote", error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
