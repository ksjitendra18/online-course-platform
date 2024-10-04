"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

import { Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { ZodFormattedError } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useQuizDataStore from "@/store/quiz-data";
import { QuizSchema } from "@/validations/quiz-question";

interface Props {
  moduleId: string;
  courseId: string;
  chapterSlug: string;
}

const ChapterQuizForm = ({ moduleId, courseId, chapterSlug }: Props) => {
  const { mutate } = useSWRConfig();
  const { incrQuestionLength } = useQuizDataStore();
  const [loading, setLoading] = useState(false);
  // const [questionType, setQuestionType] = useState<"mcq" | "true_false">("mcq");
  // const [questionTypeDisabled, setQuestionTypeDisabled] = useState(false);

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    QuizSchema,
    string
  > | null>(null);

  const modalCloseRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { option: "", isCorrect: false },
    { option: "", isCorrect: false },
    { option: "", isCorrect: false },
    { option: "", isCorrect: false },
  ]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = event.target;
    const updatedOptions = [...options];
    updatedOptions[index].option = value;
    setOptions(updatedOptions);
  };

  const handleMarkAsCorrect = (index: number) => {
    const updatedOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setOptions(updatedOptions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const parsedResult = QuizSchema.safeParse({
      question,
      options,
      moduleId,
      courseId,
      chapterSlug,
    });

    if (!parsedResult.success) {
      const err = parsedResult.error.format();
      setFormErrors(err);

      return;
    }

    try {
      const res = await fetch("/api/chapters/quiz", {
        method: "POST",
        body: JSON.stringify({ ...parsedResult.data }),
      });

      if (res.status === 201) {
        modalCloseRef.current?.click();
        mutate("questions");
        setOptions([
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
        ]);
        incrQuestionLength();
        router.refresh();
      }
    } catch (error) {
      toast.error("Error while adding question");
    } finally {
      setLoading(false);
    }
  };

  console.log(options);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600">Add Question</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>New Question</DialogTitle>
          {/* <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription> */}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="question" className="text-right">
              Question
            </Label>
            <Input
              onChange={(e) => setQuestion(e.target.value)}
              id="question"
              className="col-span-3"
            />
          </div>
          {options.map((option, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`Option ${index + 1}`} className="text-right">
                Option {index + 1}
              </Label>
              <Input
                onChange={(e) => handleChange(e, index)}
                id={`"option_${index + 1}`}
                className="col-span-2"
              />
              <button
                onClick={() => handleMarkAsCorrect(index)}
                className={cn(
                  options[index].isCorrect &&
                    "rounded-md bg-green-600 text-white transition-all duration-100 ease-in",
                  "col-span-1 flex items-center px-2 py-2"
                )}
              >
                <Check />
                <span className="ml-2 text-sm">Mark as Answer</span>
              </button>
            </div>
          ))}
        </div>
        <DialogFooter>
          {formErrors && (
            <div className="flex flex-col gap-3">
              {formErrors._errors.map((err) => (
                <p
                  key={err}
                  className="my-5 rounded-md bg-red-500 px-3 py-2 text-white"
                >
                  {err}
                </p>
              ))}
            </div>
          )}
          <Button
            disabled={loading}
            variant="app"
            onClick={() => handleSubmit()}
            type="submit"
          >
            {loading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <>Add Question</>
            )}
          </Button>
        </DialogFooter>
        <DialogClose ref={modalCloseRef} className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterQuizForm;
