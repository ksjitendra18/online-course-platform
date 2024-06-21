import z from "zod";

export const OrganizationSignupSchema = z.object({
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

  fullName: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name should be less than 50 characters" })
    .regex(/^[a-zA-Z ]+$/, {
      message: "Name should contain only alphabets.",
    }),
  userName: z
    .string({ required_error: "username is required" })
    .min(4, { message: "Username should be 4 or more than 4 characters" })
    .max(25, { message: "Username should not be more than 50 characters" })
    .regex(/^[a-z0-9]+$/, {
      message: "Username must contain only small letters and numbers.",
    })
    .trim(),
  email: z.string({ required_error: "Email is required" }).email({
    message: "Email address not valid",
  }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, {
      message: "Password should be more than 8 characters",
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, {
      message:
        "Password must contain a lowercase letter, uppercase letter, number, and symbol",
    }),
});

export type OrganizationSignupSchema = z.infer<typeof OrganizationSignupSchema>;
