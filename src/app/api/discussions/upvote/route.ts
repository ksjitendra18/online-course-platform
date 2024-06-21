import { db } from "@/db";
import { discussion, discussionVote, session } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { discussionId } = await request.json();

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

    const existingVotes = await db.query.discussionVote.findFirst({
      where: and(eq(discussionVote.discussionId, discussionId)),
      columns: { upvotes: true },
    });

    const userExistingVotes = await db.query.discussionVote.findFirst({
      where: and(
        eq(discussionVote.discussionId, discussionId),
        eq(discussionVote.userId, sessionExists.user.id)
      ),
    });

    if (userExistingVotes) {
      return Response.json({ success: true }, { status: 200 });
    }

    if (existingVotes) {
      await db.insert(discussionVote).values({
        discussionId,
        userId: sessionExists.user.id,
        upvotes: existingVotes.upvotes + 1,
      });
      return Response.json({ success: true }, { status: 201 });
    } else {
      await db.insert(discussionVote).values({
        discussionId,
        userId: sessionExists.user.id,
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
