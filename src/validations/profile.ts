import z from "zod";

export const ProfileSchema = z.object({
  fullName: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name should be less than 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, {
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
});

export type ProfileSchema = z.infer<typeof ProfileSchema>;
