import { db } from "@/db";
import { courseMember, courseModule, session } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import { ModuleInfoSchema } from "@/validations/module-info";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
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

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: params.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const moduleExists = await db.query.courseModule.findFirst({
      where: eq(courseModule.id, params.moduleId),
      columns: { id: true },
    });

    if (!moduleExists) {
      return Response.json({
        error: {
          code: "invalid_module_id",
          message: "Please enter a valid moduleId",
        },
      });
    }

    await db
      .update(courseModule)
      .set({
        title: parsedData.data.moduleName,
        slug: parsedData.data.moduleSlug,
        description: parsedData.data.moduleDescription,
      })
      .where(eq(courseModule.id, moduleExists.id));
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updting module", params.moduleId, error);

    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const { isAuth, userInfo } = await checkAuth();

    if (!isAuth || !userInfo) {
      return Response.json(
        { error: { code: "unauthenticated", message: "Login" } },
        { status: 401 }
      );
    }

    const isAuthorized = await checkAuthorizationOfCourse({
      courseId: params.courseId,
      userId: userInfo.id,
    });

    if (!isAuthorized) {
      return Response.json(
        { error: { code: "unauthorized", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const moduleExists = await db.query.courseModule.findFirst({
      where: eq(courseModule.id, params.moduleId),
      columns: { id: true },
    });

    if (!moduleExists) {
      return Response.json({
        error: {
          code: "invalid_module_id",
          message: "Please enter a valid moduleId",
        },
      });
    }

    //! FIX ME: DELETE VIDEOS

    await db.delete(courseModule).where(eq(courseModule.id, params.moduleId));
    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while deleting module", params.moduleId, error);
    return Response.json(
      {
        error: { code: "server_error", message: "Internal server Error" },
      },
      { status: 500 }
    );
  }
}
