import bcrypt from "bcryptjs";
import slugify from "slugify";

import { eq } from "drizzle-orm";
import {
  organization,
  organizationMember,
  user,
  password as dbPassword,
} from "@/db/schema";
import { db } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { OrganizationSignupSchema } from "@/validations/organization-signup";

export async function POST(request: Request) {
  const {
    orgName,
    orgSlug,
    fullName,
    userName,
    email,
    password,
  }: {
    orgName: string;
    orgSlug: string;
    fullName: string;
    userName: string;
    email: string;
    password: string;
  } = await request.json();

  try {
    const parsedData = OrganizationSignupSchema.safeParse({
      orgName,
      orgSlug,
      fullName,
      userName,
      email,
      password,
    });

    if (!parsedData.success) {
      return Response.json(
        {
          error: "validation_error",
          message: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, parsedData.data.email),
    });

    if (existingUser) {
      return Response.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedData.data.password, salt);

    const organizationId = createId();
    const userId = createId();
    await db.batch([
      db.insert(organization).values({
        id: organizationId,
        name: orgName,
        slug: orgSlug,
      }),
      db.insert(user).values({
        id: userId,
        email,
        name: fullName,
        userName,
      }),
      db.insert(dbPassword).values({
        password: hashedPassword,
        userId,
      }),
      db.insert(organizationMember).values({
        organizationId,
        userId,
        role: "admin",
      }),
    ]);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("error while organization signup", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
