import { config } from "dotenv";
import Redis from "ioredis";
import path from "path";

const envPath = path.resolve(__dirname, "..", ".env");

config({ path: envPath });

const redis = new Redis({
  host: process.env.REDIS_HOST!,
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD!,
});

export default redis;
