import { db } from "@/db";
import { user } from "@/db/schema";
import { StudentSignupSchema } from "@/validations/student-signup";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { password as dbPassword } from "@/db/schema";

export async function POST(request: Request) {
  const {
    fullName,
    userName,
    email,
    password,
  }: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
  } = await request.json();

  try {
    const parsedData = StudentSignupSchema.safeParse({
      fullName,
      userName,
      email,
      password,
    });

    if (!parsedData.success) {
      return Response.json({
        error: "validation_error",
        message: parsedData.error.format(),
      });
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, parsedData.data.email),
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "user_already_exists",
          message: "User already exists",
        },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedData.data.password, salt);
    const userId = createId();

    await db.batch([
      db.insert(user).values({
        name: parsedData.data.fullName,
        email: parsedData.data.email,
        userName: parsedData.data.userName,
        id: userId,
      }),

      db.insert(dbPassword).values({
        password: hashedPassword,
        userId,
      }),
    ]);
    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log("Error while student signup", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
