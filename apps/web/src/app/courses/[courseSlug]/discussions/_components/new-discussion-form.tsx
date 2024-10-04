"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DiscussionSchema from "@/validations/discussion";

const NewDiscussionForm = ({
  courseSlug,
  courseId,
}: {
  courseSlug: string;
  courseId: string;
}) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [validationIssue, setValidationIssue] = useState<z.ZodFormattedError<
    z.infer<typeof DiscussionSchema>,
    string
  > | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setValidationIssue(null);
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const question = formData.get("question");
    const description = formData.get("description");

    try {
      const safeParsedData = DiscussionSchema.safeParse({
        question,
        description,
        courseId,
      });

      if (!safeParsedData.success) {
        setValidationIssue(safeParsedData.error.format());
        return;
      }

      const res = await fetch("/api/discussions", {
        method: "POST",
        body: JSON.stringify(safeParsedData.data),
      });

      if (res.status === 500) {
        setError("Internal Server Error. Try again later");
        return;
      }
      // const resData = await res.json();

      if (res.status === 201) {
        router.push(`/courses/${courseSlug}/discussions`);
        router.refresh();
      }
    } catch (error) {
      setError("Error while Signup. Please try again later");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      method="post"
      className="mx-auto w-[100%] md:w-3/4 lg:w-1/2"
    >
      <label
        htmlFor="question"
        className={cn(
          error || validationIssue?.question ? "text-red-600" : "text-gray-600",
          "mt-5 block"
        )}
      >
        Question
      </label>
      <input
        type="text"
        name="question"
        id="question"
        required
        className={cn(
          error || validationIssue?.question
            ? "border-red-600"
            : "border-slate-600",
          "w-full rounded-md border-2 px-3 py-2"
        )}
      />

      {validationIssue?.question && (
        <div className="flex flex-col gap-3">
          {validationIssue?.question?._errors?.map((err, idx) => (
            <p
              key={idx}
              className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
            >
              {err}
            </p>
          ))}
        </div>
      )}
      <label
        htmlFor="description"
        className={cn(
          error || validationIssue?.description
            ? "text-red-600"
            : "text-gray-600",
          "mt-5 block"
        )}
      >
        Description
      </label>
      <textarea
        name="description"
        id="description"
        required
        className={cn(
          error || validationIssue?.description
            ? "border-red-600"
            : "border-slate-600",
          "w-full rounded-md border-2 px-3 py-2"
        )}
      />

      {validationIssue?.description && (
        <div className="flex flex-col gap-3">
          {validationIssue?.description?._errors?.map((err, idx) => (
            <p
              key={idx}
              className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
            >
              {err}
            </p>
          ))}
        </div>
      )}
      <Button disabled={loading} className="my-5 w-full" variant="app">
        {loading ? <Loader2 className="mx-auto animate-spin" /> : <>Submit</>}
      </Button>
    </form>
  );
};

export default NewDiscussionForm;
