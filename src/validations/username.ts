import { z } from "zod";

export const UsernameSchema = z
  .string({ required_error: "username is required" })
  .min(4, { message: "Username should be 4 or more than 4 characters" })
  .max(25, { message: "Username should not be more than 50 characters" })
  .regex(/^[a-z0-9]+$/, {
    message: "Username must contain only small letters and numbers.",
  })
  .trim();

export type UsernameSchema = z.infer<typeof UsernameSchema>;
