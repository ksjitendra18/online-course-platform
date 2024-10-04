"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useQuizStore from "@/store/quiz";

interface Props {
  chapterQuiz: {
    id: string;
    status: "draft" | "published" | "archived" | "deleted";
    createdAt: string | null;
    courseId: string;
    chapterId: string;
    duration: number;
    questions: {
      id: string;
      type: "single_select" | "multi_select" | "true_false" | null;
      quizId: string;
      questionText: string;
      answers: {
        id: string;
        questionId: string;
        answerText: string;
      }[];
    }[];
  };

  moduleId: string;
  courseId: string;
  chapterSlug: string;
  chapterId: string;
}
const ChapterQuizQuestion = ({
  chapterQuiz,
  moduleId,
  courseId,
  chapterId,
  chapterSlug,
}: Props) => {
  const qNo = ["a", "b", "c", "d"];
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<
    { questionId: string; answerId: string }[]
  >([]);

  const { hasStarted, setHasEnded } = useQuizStore();

  const handleClick = (questionId: string, answerId: string) => {
    if (!hasStarted) {
      toast.error("Please Start the quiz first");
      return;
    }
    const existingIndex = selected.findIndex(
      (item) => item.questionId === questionId
    );

    if (existingIndex !== -1) {
      const updatedSelected = [...selected];
      updatedSelected[existingIndex] = { questionId, answerId };
      setSelected(updatedSelected);
    } else {
      setSelected((prevSelected) => [
        ...prevSelected,
        { questionId, answerId },
      ]);
    }
  };

  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chapters/quiz/response", {
        method: "POST",
        body: JSON.stringify({
          moduleId,
          courseId,
          chapterSlug,
          chapterId,
          responses: selected,
        }),
      });

      const resData = await res.json();
      console.log(res.status, resData);

      setHasEnded();

      router.refresh();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-5 flex w-full flex-col gap-5 px-4">
      {chapterQuiz.questions.map((question, index) => (
        <div
          key={question.id}
          className="flex flex-col rounded-md bg-white px-5 py-3 shadow-md"
        >
          <h3 className="font-semibold">
            Q{index + 1}. {question.questionText}
          </h3>

          <div>
            <p className="my-3">Answer Choices</p>

            <div className="grid grid-cols-2 grid-rows-2 gap-5">
              {question.answers.map((answer, index) => (
                <button
                  onClick={() => handleClick(question.id, answer.id)}
                  className={cn(
                    selected.find((s) => s.answerId === answer.id)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200",
                    "text flex items-center truncate rounded-md px-3 py-3 transition-all duration-100"
                  )}
                  key={answer.id}
                >
                  {qNo[index]}. {answer.answerText}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="my-5 cursor-pointer rounded-md bg-blue-600 px-10 py-3 text-white"
        >
          {loading ? <Loader2 className="mx-auto animate-spin" /> : <>Submit</>}
        </Button>
      </div>
    </div>
  );
};

export default ChapterQuizQuestion;
