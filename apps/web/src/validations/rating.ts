import z from "zod";

export const ReviewSchema = z.object({
  description: z
    .string({ required_error: "Description is required" })
    .min(1, { message: "Description is required" })
    .max(300, {
      message: "Description should be less than 300 characters",
    })
    .trim(),

  rating: z
    .number({
      required_error: "Rating is required",
    })
    .min(1, { message: "Rating can't be less than zero" })
    .max(5, { message: "Rating can't be greater than five" }),

  resourceData: z
    .string({
      required_error:
        "Resource Data is required. Please upload the video or wait for upload to finish",
    })
    .min(1, {
      message:
        "Resource Data is required. Please upload the video or wait for upload to finish",
    }),
  moduleId: z
    .string({
      required_error: "Module ID is required.",
    })
    .min(1, {
      message: "Module ID is required.",
    }),
  courseId: z
    .string({
      required_error: "Course ID is required",
    })
    .min(1, {
      message: "Course ID is required",
    }),

  duration: z.number({ required_error: "duration is required" }),

  type: z.enum(["quiz", "video", "attachment", "article"]),
});

export type ReviewSchema = z.infer<typeof ReviewSchema>;
