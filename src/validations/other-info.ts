import z from "zod";

// TODO: IMPLEMENT MULTIPLE VALIDITY OPTIONS
export const OtherInfoSchema = z
  .object({
    courseIsFree: z.boolean(),
    coursePrice: z.number(),
    teacherName: z
      .string({ required_error: "Teacher Name is required" })
      .min(1, { message: "Teacher name is required" }),
    courseCategories: z.array(
      z.string({ required_error: "Invalid category" }),
      {
        required_error: "Category is required",
      }
    ),
    courseValidity: z
      .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
      .refine((val) => [-1, 180, 365, 730].includes(val), {
        message:
          "Invalid course validity. Choose unlimited (-1), 6 months (180), 1 year (365), or 2 years (730).",
      }),
    courseImg: z.string({ required_error: "Image is required" }).url(),
  })
  .superRefine((val, ctx) => {
    if (!val.courseIsFree) {
      if (val.coursePrice < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coursePrice"],
          message: "Course Price should be greater than zero",
        });
      }
    }
  });

export type OtherInfoSchema = z.infer<typeof OtherInfoSchema>;
