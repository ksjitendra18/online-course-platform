import { db } from "@/db";
import { organization, organizationMember, session } from "@/db/schema";
import redis from "@/lib/redis";
import { OrganizationSetupSchema } from "@/validations/organization-setup";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    orgName,
    orgSlug,
  }: {
    orgName: string;
    orgSlug: string;
  } = await request.json();

  try {
    const parsedData = OrganizationSetupSchema.safeParse({
      orgName,
      orgSlug,
    });

    if (!parsedData.success) {
      return Response.json(
        {
          error: {
            code: "validation_error",
            message: parsedData.error.format(),
          },
        },
        { status: 400 }
      );
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
          columns: {
            id: true,
          },
        },
      },
    });

    if (!sessionExists) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 403 }
      );
    }
    const organizationId = createId();

    await db.batch([
      db.insert(organization).values({
        id: organizationId,
        name: orgName,
        slug: orgSlug,
      }),

      db.insert(organizationMember).values({
        organizationId,
        userId: sessionExists.user.id,
        role: "admin",
      }),
    ]);

    await redis.del(token);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while creating new organization", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
