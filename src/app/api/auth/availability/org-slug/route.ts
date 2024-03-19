import { db } from "@/db";
import { organization } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const {
    slug,
  }: {
    slug: string;
  } = await request.json();

  if (!slug || slug.length < 1) {
    return Response.json(
      {
        error: "validation_error",
        message: "slug is required",
        missing: ["slug"],
      },
      { status: 400 }
    );
  }

  try {
    const orgInfo = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
    });

    if (orgInfo) {
      return Response.json(
        {
          error: "slug_already_exist",
          message: "Slug already exist. Please try another one",
        },
        { status: 409 }
      );
    }

    return Response.json({
      isAvailable: true,
    });
  } catch (error) {
    return Response.json(
      {
        error: "server_error",
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
