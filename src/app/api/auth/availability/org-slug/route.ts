import { db } from "@/db";
import { organization, session } from "@/db/schema";
import { OrgSlugSchema } from "@/validations/org-slug";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const {
    orgSlug,
  }: {
    orgSlug: string;
  } = await request.json();

  try {
    const parsedData = OrgSlugSchema.safeParse(orgSlug);

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

    const orgSlugExists = await db.query.organization.findFirst({
      columns: { slug: true },
      where: eq(organization.slug, parsedData.data),
    });

    if (orgSlugExists) {
      return Response.json(
        {
          available: false,
          error: { code: "slug_exists", message: "Org Slug already exists." },
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          available: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("Error while checking org slug", error);

    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
