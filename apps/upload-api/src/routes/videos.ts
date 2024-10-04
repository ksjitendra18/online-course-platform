import Elysia from "elysia";
import crypto from "node:crypto";
import { createReadStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Upload } from "tus-js-client";

import redis from "@learningapp/redis";

import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { decryptCookie } from "../lib/aes";

function ffmpegProbe(videoPath: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

const videoRoutes = new Elysia({ prefix: "/v1" }).post(
  "/video",
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
        console.log("decrypting", authToken);
        const decrypted = await decryptCookie(authToken);
        console.log("decrypted", decrypted);
        const sessionExists = await redis.exists(decrypted);

        console.log("sessionExists", sessionExists);
        if (!sessionExists) {
          console.log("not session exists");
          return Response.json(
            { error: { code: "invalid_token", message: "Invalid token" } },
            { status: 401 }
          );
        }
      } catch (error) {
        console.log("caught error", error);
        console.log("returning invalid");
        return Response.json(
          { error: { code: "invalid_token", message: "Invalid token" } },
          { status: 401 }
        );
      }

      console.log("now upload...");
      const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
      const BUNNY_VIDEO_API_KEY = process.env.BUNNY_VIDEO_API_KEY!;

      try {
        console.log("lets upload..here is formdata");
        const formData = await request.formData();
        const file = formData.get("video");

        const courseId = formData.get("courseId");

        if (!file) {
          return Response.json(
            { error: { code: "missing_file", message: "Missing file" } },
            { status: 400 }
          );
        }
        const hash = new Bun.CryptoHasher("sha256");

        if (file instanceof Blob) {
          const filename = file.name;
          const mimeType = file.type;
          const extension = filename.split(".").pop();
          const fileSize = file.size;

          // max 1 GB file size
          if (fileSize > 1024 * 1024 * 1024) {
            return Response.json(
              {
                error: {
                  code: "file_size_too_large",
                  message: "File size too large",
                },
              },
              { status: 400 }
            );
          }

          const optionBody = JSON.stringify({
            title: courseId + "-" + crypto.randomUUID().substring(0, 5),
          });

          const fileId = crypto.randomUUID();
          const fileName = `${fileId}.${extension}`;
          const filePath = `./uploads/${fileId}.${extension}`;
          Bun.write(filePath, file);

          const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;
          const options = {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/*+json",
              AccessKey: BUNNY_VIDEO_API_KEY,
            },
            body: optionBody,
          };

          const bunnyRes = await fetch(url, options);

          const resData = await bunnyRes.json();

          const date = new Date();
          date.setTime(date.getTime() + 24 * 60 * 60 * 1000);

          const expirationTime = date.getTime();
          const videoId = resData.guid;

          hash.update(
            BUNNY_LIBRARY_ID + BUNNY_VIDEO_API_KEY + expirationTime + videoId
          );
          const hashValue = hash.digest("hex");

          const videoMetaData = await ffmpegProbe(filePath);
          console.log(videoMetaData);

          const fileStream = createReadStream(filePath);

          var upload = new Upload(fileStream, {
            endpoint: "https://video.bunnycdn.com/tusupload",
            retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
            headers: {
              AuthorizationSignature: hashValue,
              AuthorizationExpire: String(expirationTime),
              VideoId: videoId,
              LibraryId: BUNNY_LIBRARY_ID,
            },
            metadata: {
              filetype: file.type,
              title: fileName,
            },
            onError: function (error) {
              console.log("error while upload", error);
            },
            onProgress: function (bytesUploaded, bytesTotal) {
              console.log("uploading 🚀🚀", bytesTotal, bytesUploaded);
            },
            onSuccess: async function () {
              await unlink(filePath);
              console.log("upload done");
            },
          });

          // Check if there are any previous uploads to continue.
          upload.findPreviousUploads().then(function (previousUploads) {
            // Found previous uploads so we select the first one.
            if (previousUploads.length) {
              upload.resumeFromPreviousUpload(previousUploads[0]);
            }

            // Start the upload
            upload.start();
          });

          return Response.json({
            message: "Uploaded successfully",
            data: { videoId, duration: videoMetaData.format.duration ?? 0 },
          });
        } else {
          return Response.json(
            { error: { code: "invalid_file", message: "Invalid file" } },
            { status: 400 }
          );
        }
      } catch (error) {
        console.log("Error while uploading video", error);
        return Response.json(
          { error: { code: "server_error", message: "Internal server error" } },
          { status: 500 }
        );
      }
    } catch (error) {
      console.log("Error while uploading video", error);
      return Response.json(
        { error: { code: "server_error", message: "Internal server error" } },
        { status: 500 }
      );
    }
  }
);

export default videoRoutes;
