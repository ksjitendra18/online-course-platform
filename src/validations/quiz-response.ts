import z from "zod";

const QuizResponseSchema = z.object({
  questionId: z
    .string({ required_error: "Question ID is required" })
    .regex(/^[a-z]+/, {
      message: "Question ID must only contain small letters",
    })
    .trim(),
  answerId: z
    .string({ required_error: "Answer ID is required" })
    .regex(/^[a-z]+/, {
      message: "Answer ID must only contain small letters",
    })
    .trim(),
});

// export const QuizResponsesSchema = z.array(QuizResponseSchema);
export const QuizResponsesSchema = z.object({
  chapterSlug: z
    .string({ required_error: "Chapter Slug is required" })
    .min(1, { message: "Chapter Slug is required" })
    .max(50, { message: "Chapter Slug should be less than 50 characters" })
    .regex(/^[a-z]+\w*(?:-[a-zA-Z]+\w*)*$/, {
      message:
        "Chapter Slug should contain only alphabets(lowercase), dash and numbers.",
    })
    .trim(),
  moduleId: z.string({
    required_error: "Module ID is required.",
  }),

  courseId: z.string({
    required_error: "Course ID is required",
  }),
  chapterId: z.string({
    required_error: "Chapter ID is required",
  }),

  responses: z.array(QuizResponseSchema),
});

export type QuizResponseSchema = z.infer<typeof QuizResponseSchema>;
export type QuizResponsesSchema = z.infer<typeof QuizResponsesSchema>;
