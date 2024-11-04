import { ulid } from "ulidx";

import { db } from "@/db";
import { organization, organizationMember } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { OrganizationSetupSchema } from "@/validations/organization-setup";

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

    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const organizationId = ulid();

    await db.batch([
      db.insert(organization).values({
        id: organizationId,
        name: orgName,
        slug: orgSlug,
      }),

      db.insert(organizationMember).values({
        organizationId,
        userId: userInfo.id,
        role: "admin",
      }),
    ]);

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while creating new organization", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
