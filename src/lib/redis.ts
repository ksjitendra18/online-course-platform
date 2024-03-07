// import { Redis } from "@upstash/redis";
import { Redis } from "ioredis";

// const redis = new Redis({
//   url: process.env.REDIS_URL!,
//   token: process.env.REDIS_TOKEN!,
// });
const redis = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

export default redis;
