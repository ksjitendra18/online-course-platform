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
import { hashPassword, sendVerificationMail } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

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
    const userIP = request.headers.get("X-Forwarded-For") ?? "dev";

    const EMAIL_LIMIT_OPTIONS = {
      key: `${email}:la`,
      limit: 100,
      duration: 86400,
    };
    const IP_LIMIT_OPTIONS = {
      key: `${userIP}:la`,
      limit: 50,
      duration: 86400,
    };
    const IP_HOUR_LIMIT_OPTIONS = {
      key: `${userIP}:hla`,
      limit: 20,
      duration: 3600,
    };

    const emailRateLimit = rateLimit(EMAIL_LIMIT_OPTIONS);
    const ipRateLimit = rateLimit(IP_LIMIT_OPTIONS);
    const ipHourRateLimit = rateLimit(IP_HOUR_LIMIT_OPTIONS);

    const [resp1, resp2, resp3] = await Promise.all([
      emailRateLimit,
      ipRateLimit,
      ipHourRateLimit,
    ]);
    if (
      resp1 instanceof Response ||
      resp2 instanceof Response ||
      resp3 instanceof Response
    ) {
      return resp1 || resp2 || resp3;
    }
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
          error: {
            code: "validation_error",
            message: parsedData.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      columns: { id: true },
      where: eq(user.email, parsedData.data.email),
    });

    if (existingUser) {
      return Response.json(
        {
          error: {
            code: "user_already_exists",
            message: "User already exists",
          },
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword({
      password: parsedData.data.password,
    });

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
    const verificationResponse = await sendVerificationMail({ email });

    if (verificationResponse) {
      return Response.json(
        { data: { id: verificationResponse.verificationId } },
        { status: 201 }
      );
    } else {
      console.log("error while sending the mail");
      await db.delete(user).where(eq(user.email, email));
      return Response.json(
        {
          error: { code: "email_error", message: "Error while sending email" },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("error while organization signup", error);
    return Response.json(
      { error: { code: "server_error", message: "Server Error" } },
      { status: 500 }
    );
  }
}
