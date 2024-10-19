import { logger } from "@bogeychan/elysia-logger";
import { cors } from "@elysiajs/cors";
import { cron } from "@elysiajs/cron";
import redis from "@learningapp/redis";
import { Elysia } from "elysia";

import imageRoutes from "./routes/image";
import videoRoutes from "./routes/videos";

const corsOrigin =
  Bun.env.NODE_ENV === "production"
    ? "learningapp.link"
    : "http://localhost:3000";


const app = new Elysia({
  serve: {
    maxRequestBodySize: Number.MAX_SAFE_INTEGER,
  },
})
  .use(
    cors({
      origin: corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposeHeaders: ["Content-Range"],
      credentials: true,
    })
  )
  .use(videoRoutes)
  .use(imageRoutes)
  .get("/", () => "Learning App")
  .listen(process.env.API_PORT || 3010);

app.use(
  cron({
    name: "delete-video",
    pattern: "0 0 * * *",
    async run() {
      const videoId = await redis.spop("delete_videos");
      try {
        if (!videoId) {
          return;
        }

        const url = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`;
        const options = {
          method: "DELETE",
          headers: {
            accept: "application/json",
            "content-type": "application/*+json",
            AccessKey: process.env.BUNNY_VIDEO_API_KEY!,
          },
        };

        const bunnyRes = await fetch(url, options);

        const resData = await bunnyRes.json();

        if (bunnyRes.status !== 200) {
          console.log("error while deleting video", resData);
          redis.sadd("delete_videos", videoId);
          return;
        }
        console.log("video deleted successfully", videoId);
      } catch (error) {
        console.log("Error while deleting video", error);
        if (videoId) {
          redis.sadd("delete_videos", videoId);
        }
      }
    },
  })
);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
