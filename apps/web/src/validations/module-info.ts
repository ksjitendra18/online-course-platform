import z from "zod";

export const ModuleInfoSchema = z.object({
  title: z
    .string({ required_error: "Module Name is required" })
    .min(1, { message: "Module Name is required" })
    .max(50, { message: "Module Name should be less than 50 characters" })
    .regex(/^[a-zA-Z0-9'-\s]+$/, {
      message: "Module name should contain only alphabets and numbers.",
    })
    .trim(),

  slug: z
    .string({ required_error: "Module Slug is required" })
    .min(1, { message: "Module Slug is required" })
    .max(50, { message: "Module Slug should be less than 50 characters" })
    .regex(/^[a-z]+\w*(?:-[a-zA-Z0-9]+\w*)*$/, {
      message:
        "Module Slug should contain only alphabets(lowercase), dash and numbers.",
    })
    .trim(),

  description: z
    .string({ required_error: "Module Description is required" })
    .min(1, { message: "Module Description is required" })
    .max(300, {
      message: "Module Description should be less than 300 characters",
    })
    .trim(),

  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
});

export type ModuleInfoSchema = z.infer<typeof ModuleInfoSchema>;
