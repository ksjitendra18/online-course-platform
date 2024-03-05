import { Redis } from "@upstash/redis";

console.log("token", {
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});
const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export default redis;
