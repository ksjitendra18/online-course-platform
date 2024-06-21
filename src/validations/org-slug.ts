import { object, string, z } from "zod";

export const OrgSlugSchema = z
  .string({ required_error: "Organisation Slug is required" })
  .min(4, { message: "Slug should be 4 or more than 4 characters" })
  .max(50, { message: "Slug should be less than 50 characters" })
  .regex(/^[a-z0-9-]+$/, {
    message: "Slug should contain only alphabets and numbers.",
  })
  .regex(/^(?!-)[a-z0-9-]+(?!-)$/, {
    message: "Slug should not start or end with hypen.",
  });

export type OrgSlugSchema = z.infer<typeof OrgSlugSchema>;
