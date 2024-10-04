import { and, count, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { courseModule } from "@/db/schema";
import { checkAuth } from "@/lib/auth";
import { ModuleInfoSchema } from "@/validations/module-info";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { moduleName, moduleDescription, moduleSlug } = await request.json();

    const parsedData = ModuleInfoSchema.safeParse({
      moduleName,
      moduleSlug,
      moduleDescription,
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

    const slugExists = await db.query.courseModule.findFirst({
      where: and(
        eq(courseModule.slug, parsedData.data.moduleSlug),
        eq(courseModule.courseId, params.courseId)
      ),
      columns: { id: true },
    });

    if (slugExists) {
      return Response.json(
        {
          error: {
            code: "slug_already_exists",
            message:
              "A module with this slug already exists for the given course.",
          },
        },
        { status: 409 }
      );
    }

    const [courseModules] = await db
      .select({ count: count(courseModule.id) })
      .from(courseModule)
      .where(eq(courseModule.courseId, params.courseId));

    const newModule = await db
      .insert(courseModule)
      .values({
        title: parsedData.data.moduleName,
        description: parsedData.data.moduleDescription,
        slug: parsedData.data.moduleSlug,
        courseId: params.courseId,
        status: "draft",
        position: courseModules.count + 1,
      })
      .returning({
        id: courseModule.id,
        modulePosition: courseModule.position,
      });

    return Response.json(
      {
        data: {
          moduleId: newModule[0].id,
          modulePosition: newModule[0].modulePosition,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("error while creating new module", error);
    return Response.json(
      {
        error: {
          code: "server_error",
          message: "Please try again later",
        },
      },
      { status: 500 }
    );
  }
}
