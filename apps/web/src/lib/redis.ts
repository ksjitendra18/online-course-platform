import { Redis } from "ioredis";

import { env } from "@/utils/env/server";

const redis = new Redis({
  port: 6379,
  host: env.REDIS_HOST,
  username: "default",
  password: env.REDIS_PASSWORD,
});

export default redis;
