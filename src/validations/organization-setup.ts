import z from "zod";

export const OrganizationSetupSchema = z.object({
  orgName: z
    .string({ required_error: "Organisation Name is required" })
    .min(1, { message: "Organisation Name is required" })
    .max(50, { message: "Organisation Name should be less than 50 characters" })
    .regex(/^[a-zA-Z0-9\s]+$/, {
      message: "Organization name should contain only alphabets and numbers.",
    }),

  orgSlug: z
    .string({ required_error: "Organisation Slug is required" })
    .min(4, { message: "Slug should be 4 or more than 4 characters" })
    .max(50, { message: "Slug should be less than 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug should contain only alphabets and numbers.",
    })
    .regex(/^(?!-)[a-z0-9-]+(?!-)$/, {
      message: "Slug should not start or end with hypen.",
    }),
});

export type OrganizationSetupSchema = z.infer<typeof OrganizationSetupSchema>;
