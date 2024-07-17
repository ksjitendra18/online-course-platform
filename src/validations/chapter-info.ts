import z from "zod";

export const ChapterInfoSchema = z.object({
  chapterName: z
    .string({ required_error: "Chapter Name is required" })
    .min(1, { message: "Chapter Name is required" })
    .max(50, { message: "Chapter Name should be less than 50 characters" })
    .regex(/^[a-zA-Z0-9'-\s]+$/, {
      message: "Chapter name should contain only alphabets and numbers.",
    })
    .trim(),

  chapterSlug: z
    .string({ required_error: "Chapter Slug is required" })
    .min(1, { message: "Chapter Slug is required" })
    .max(50, { message: "Chapter Slug should be less than 50 characters" })
    // .regex(/^[a-z]+\w*(?:-[a-zA-Z]+\w*)*$/, {
    .regex(/^[a-z]+\w*(?:-[a-zA-Z0-9]+\w*)*$/, {
      message:
        "Chapter Slug should contain only alphabets(lowercase), dash and numbers.",
    })
    .trim(),

  chapterDescription: z
    .string({ required_error: "Chapter Description is required" })
    .min(1, { message: "Chapter Description is required" })
    .max(300, {
      message: "Chapter Description should be less than 300 characters",
    })
    .trim(),

  isFree: z
    .boolean({
      required_error: "Select if you want course to be free or paid",
    })
    .default(false),

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

  isPublished: z.boolean().optional().default(false),

  type: z.enum(["quiz", "video", "attachment", "article"]),
});

export type ChapterInfoSchema = z.infer<typeof ChapterInfoSchema>;
