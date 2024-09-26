import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DB_URL: z.string().url(),
    DB_AUTH_TOKEN: z.string(),
    GOOGLE_AUTH_CLIENT: z.string(),
    GOOGLE_AUTH_SECRET: z.string(),
    GOOGLE_AUTH_CALLBACK_URL: z.string(),
    ZOHO_MAIL_TOKEN: z.string(),
    RAZORPAY_KEY: z.string(),
    RAZORPAY_SECRET: z.string(),
    RAZORPAY_WEBHOOK_SECRET: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PASSWORD: z.string(),
    RECOVERY_CODE_SECRET: z.string().min(32),
    TWO_FA_SECRET: z.string().min(32),
    SESSION_COOKIE_SECRET: z.string().min(32),
  },

  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },

  experimental__runtimeEnv: process.env,
});
