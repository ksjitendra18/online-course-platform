import z from "zod";

export const BasicInfoSchema = z.object({
  title: z
    .string({ required_error: "Course Name is required" })
    .min(1, { message: "Course Name is required" })
    .max(50, { message: "Course Name should be less than 50 characters" })
    .regex(/^[a-zA-Z0-9':&-\s]+$/, {
      message: "Course name should contain only alphabets and numbers.",
    })
    .trim(),

  slug: z
    .string({ required_error: "Course Slug is required" })
    .min(4, { message: "Slug should be 4 or more than 4 characters" })
    .max(50, { message: "Slug should be less than 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug should contain only alphabets and numbers",
    })
    .regex(/^(?!-)[a-z0-9-]+(?!-)$/, {
      message: "Slug should not start or end with hypen",
    })
    .trim(),

  description: z
    .string({ required_error: "Course Description is required" })
    .min(1, { message: "Course Description is required" })
    .max(300, {
      message: "Course Description should be less than 300 characters",
    })
    .trim(),

  level: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Level is required",
  }),

  isFree: z.boolean({ required_error: "Course payment status is required" }),
});

export type BasicInfoSchema = z.infer<typeof BasicInfoSchema>;
