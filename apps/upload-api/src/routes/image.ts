import Elysia from "elysia";
import crypto from "node:crypto";
import { createReadStream } from "node:fs";
import tus from "tus-js-client";

import { unlink } from "node:fs/promises";
import { decryptCookie } from "../lib/aes";
import redis from "@learningapp/redis";

const imageRoutes = new Elysia({ prefix: "/v1" }).post(
  "/image",
  async ({ request, cookie }) => {
    try {
      const authToken = cookie["auth-token"].value;
      if (!authToken) {
        return Response.json(
          { error: { code: "unauthorized", message: "Unauthorized" } },
          { status: 401 }
        );
      }
      try {
        const decrypted = await decryptCookie(authToken);

        const sessionExists = await redis.exists(decrypted);
        console.log("sessionExists", sessionExists);
        if (!sessionExists) {
          return Response.json(
            { error: { code: "invalid_token", message: "Invalid token" } },
            { status: 401 }
          );
        }
      } catch (error) {
        return Response.json(
          { error: { code: "invalid_token", message: "Invalid token" } },
          { status: 401 }
        );
      }

      const bunnyCDNApiKey = process.env.BUNNY_CDN_API_KEY;
      const storageZoneName = process.env.STORAGE_ZONE_NAME;
      const storageZonePath = process.env.STORAGE_ZONE_PATH;
      try {
        const formData = await request.formData();
        const file = formData.get("image");

        if (!file) {
          return Response.json(
            { error: { code: "missing_file", message: "Missing file" } },
            { status: 400 }
          );
        }

        if (file instanceof Blob) {
          const filename = file.name;
          const mimeType = file.type;
          const extension = filename.split(".").pop();
          const fileSize = file.size;

          console.log("mimeType", mimeType);

          if (!mimeType.startsWith("image")) {
            return Response.json(
              { error: { code: "invalid_file", message: "Invalid file" } },
              { status: 400 }
            );
          }

          // max upload size is 10MB
          if (fileSize > 10 * 1024 * 1024) {
            return Response.json(
              {
                error: { code: "size_exceeded", message: "File size exceeded" },
              },
              { status: 400 }
            );
          }

          const fileId = crypto.randomUUID();
          const fileName = `${fileId}.${extension}`;
          const filePath = `./uploads/${fileId}.${extension}`;
          Bun.write(filePath, file);

          const pngCompressUrl = `https://storage.bunnycdn.com/${storageZoneName}/${storageZonePath}/${fileName}`;

          console.log("url", fileName, pngCompressUrl);
          await fetch(pngCompressUrl, {
            method: "PUT",
            headers: {
              AccessKey: bunnyCDNApiKey!,
              "Content-Type": "image/png",
            },
            body: file,
          });

          await unlink(filePath);

          return Response.json({
            message: "Uploaded successfully",
            data: `https://course-img-jsx.b-cdn.net/images/${fileName}`,
          });
        } else {
          return Response.json(
            { error: { code: "invalid_file", message: "Invalid file" } },
            { status: 400 }
          );
        }
      } catch (error) {
        console.log("Error while uploading image", error);
        return Response.json(
          { error: { code: "server_error", message: "Internal server error" } },
          { status: 500 }
        );
      }
    } catch (error) {
      console.log("Error while uploading image", error);
      return Response.json(
        { error: { code: "server_error", message: "Internal server error" } },
        { status: 500 }
      );
    }
  }
);

export default imageRoutes;
