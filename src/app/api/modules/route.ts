import { db } from "@/db/index";
import { courseModule, session } from "@/db/schema";
import { ModuleInfoSchema } from "@/validations/module-info";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { moduleName, moduleDescription, moduleSlug, courseId } =
    await request.json();

  const parsedData = ModuleInfoSchema.safeParse({
    moduleName,
    moduleSlug,
    moduleDescription,
  });

  if (!parsedData.success) {
    return Response.json(
      { error: "validation_error", message: parsedData.error.format() },
      { status: 400 }
    );
  }

  // check if user is valid
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    return Response.json(
      { error: "unauthenticated", message: "Login" },
      { status: 403 }
    );
  }

  const sessionExists = await db.query.session.findFirst({
    where: eq(session.id, token),
    with: {
      user: {
        with: {
          organizationMember: true,
        },
      },
    },
  });

  if (!sessionExists) {
    return Response.json(
      { error: "unathuenticated", message: "Login" },
      { status: 403 }
    );
  }

  const userOrgInfo = sessionExists.user.organizationMember.filter(
    (org) => org.role === "owner"
  );

  const courseModules = await db
    .select()
    .from(courseModule)
    .where(eq(courseModule.courseId, courseId));

  // const position = () => {
  //   if (courseModules.length === 0) {
  //     return 1;
  //   }
  //   return courseModules.length + 1;
  // };

  // TODO: check if slug exists
  try {
    const newModule = await db
      .insert(courseModule)
      .values({
        title: parsedData.data.moduleName,
        description: parsedData.data.moduleDescription,
        slug: parsedData.data.moduleSlug,
        courseId,
        position: courseModules.length + 1,
      })
      .returning({
        id: courseModule.id,
        modulePosition: courseModule.position,
      });

    return Response.json(
      {
        data: {
          moduleId: newModule[0].id,

          modulePos: newModule[0].modulePosition,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("error while creating new module", error);
    return Response.json(
      {
        error: "server_error",
        message: "Please try again",
      },
      { status: 500 }
    );
  }
}
