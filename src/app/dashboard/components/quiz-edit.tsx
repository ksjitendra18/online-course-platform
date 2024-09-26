"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent, RefObject, useRef, useState } from "react";

import { Check, Edit, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import { ZodFormattedError } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useQuizDataStore from "@/store/quiz-data";
import { QuizEditSchema, QuizSchema } from "@/validations/quiz-question";

interface Option {
  value: string;
  correct: boolean;
}

interface Props {
  questionId: string;
  quizId: string;
  quizQuestion: string;
  quesOptions: {
    option: string;
    isCorrect: boolean;
  }[];
}

const QuizEdit = ({ quizId, questionId, quesOptions, quizQuestion }: Props) => {
  const { mutate } = useSWRConfig();
  const { incrQuestionLength } = useQuizDataStore();
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<"mcq" | "true_false">("mcq");
  const [questionTypeDisabled, setQuestionTypeDisabled] = useState(false);

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    QuizSchema,
    string
  > | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [question, setQuestion] = useState(quizQuestion);

  const [options, setOptions] = useState(quesOptions);

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
    const parsedResult = QuizEditSchema.safeParse({
      question,
      options,
      quizId,
    });

    if (!parsedResult.success) {
      const err = parsedResult.error.format();
      setFormErrors(err);

      return;
    }

    try {
      const res = await fetch(`/api/chapters/quiz/${quizId}/${questionId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...parsedResult.data }),
      });
      const resData = await res.json();

      if (res.status === 200) {
        modalCloseRef.current?.click();
        router.refresh();
        mutate("questions");
        setOptions([
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
        ]);
      }
    } catch (error) {
      toast.error("Error while editing question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600">
          <Edit />
        </Button>
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
              defaultValue={question}
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
                defaultValue={option.option}
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
          <Button
            disabled={loading}
            variant="app"
            onClick={() => handleSubmit()}
            type="submit"
          >
            {loading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <>Save Question</>
            )}
          </Button>
        </DialogFooter>
        <DialogClose ref={modalCloseRef} className="hidden"></DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default QuizEdit;
