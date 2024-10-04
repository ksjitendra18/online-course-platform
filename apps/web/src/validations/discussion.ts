import { object, string } from "zod";

const DiscussionSchema = object({
  question: string({ required_error: "Question is required" })
    .min(4, "Question must contain atleast 4 characters")
    .max(256, { message: "Question can have maximum 256 characters." })

    .trim(),
  description: string({ required_error: "Description is required" })
    .min(8, "Description should be more than 8 characters")
    .max(1000, "Description can have maximum 1000 characters")

    .trim(),

  courseId: string({
    required_error: "Course ID is required.",
  }),
});

export default DiscussionSchema;
