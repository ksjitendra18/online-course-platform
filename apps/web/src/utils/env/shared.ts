import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]),
  },
  runtimeEnv: {
    // eslint-disable-next-line n/no-process-env
    NODE_ENV: process.env.NODE_ENV,
  },
});
