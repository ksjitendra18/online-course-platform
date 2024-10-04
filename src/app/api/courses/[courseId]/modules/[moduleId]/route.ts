import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { clearTagCache } from "@/actions/clear-tag-cache";
import { db } from "@/db";
import { courseModule } from "@/db/schema";
import { checkAuth, checkAuthorizationOfCourse } from "@/lib/auth";
import redis from "@/lib/redis";
import { ModuleInfoSchema } from "@/validations/module-info";

const PartialModuleInfoSchema = ModuleInfoSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { courseId: string; moduleId: string } }
) {
  try {
    const reqBody = await request.json();

    const parsedData = PartialModuleInfoSchema.safeParse(reqBody);

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
      .set(parsedData.data)
      .where(eq(courseModule.id, moduleExists.id));

    await clearTagCache("get-course-data");

    return Response.json({ success: true });
  } catch (error) {
    console.log("Error while updating module", params.moduleId, error);

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
      with: {
        chapter: {
          columns: {
            id: true,
          },
          with: {
            videoData: {
              columns: {
                playbackId: true,
              },
            },
          },
        },
      },
    });

    if (!moduleExists) {
      return Response.json(
        {
          error: {
            code: "module_not_found",
            message: "Module not found",
          },
        },
        { status: 404 }
      );
    }

    const videoIds = moduleExists.chapter.map(
      (chapter) => chapter.videoData[0].playbackId
    );

    await redis.sadd("delete_videos", ...videoIds);

    await db.delete(courseModule).where(eq(courseModule.id, params.moduleId));

    await clearTagCache("get-course-data");

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
