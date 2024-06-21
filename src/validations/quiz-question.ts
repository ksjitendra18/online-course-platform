import z from "zod";

export const OptionSchema = z.object({
  option: z.string({ required_error: "Option is required" }),
  isCorrect: z.boolean({ required_error: "Please pass the isCorrect" }),
});

export const QuizEditSchema = z.object({
  quizId: z
    .string({
      required_error: "Quiz ID is required",
    })
    .min(1, {
      message: "Quiz ID is required",
    }),
  question: z.string({ required_error: "Question is required" }),
  options: z.array(OptionSchema),
});

export const QuizSchema = z.object({
  chapterSlug: z
    .string({ required_error: "Chapter Slug is required" })
    .min(1, { message: "Chapter Slug is required" })
    .max(50, { message: "Chapter Slug should be less than 50 characters" })
    .regex(/^[a-z]+\w*(?:-[a-zA-Z]+\w*)*$/, {
      message:
        "Chapter Slug should contain only alphabets(lowercase), dash and numbers.",
    })
    .trim(),
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
  question: z.string({ required_error: "Question is required" }),
  options: z.array(OptionSchema),
});

export type QuizSchema = z.infer<typeof QuizSchema>;
