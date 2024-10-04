import React from "react";

import { cn } from "@/lib/utils";

type Props =
  | {
      response: {
        courseId: string;
        id: string;
        duration: number;
        createdAt: number;
        userId: string;
        quizId: string;
        quizUserResponse: {
          id: string;
          questionId: string;
          quizResponseId: string;
          answerId: string;
        }[];
      }[];
      questions: {
        id: string;
        type: "single_select" | "multi_select" | "true_false" | null;
        quizId: string;
        questionText: string;
        answers: {
          id: string;
          questionId: string;
          answerText: string;
          isCorrect: boolean;
        }[];
      }[];
    }
  | undefined;

const ChapterQuizResponseNew = ({
  chapterQuizResponse,
}: {
  chapterQuizResponse: Props;
}) => {
  const qNo = ["a", "b", "c", "d"];

  return (
    <div className="mt-5 flex flex-col gap-5 px-4">
      {chapterQuizResponse!.questions.map((question, index) => (
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
                <div
                  className={cn(
                    answer.isCorrect &&
                      answer.id ===
                        chapterQuizResponse?.response[0].quizUserResponse.find(
                          (r) => r.questionId === question.id
                        )?.answerId
                      ? "bg-[#a2ffa2]"
                      : "bg-slate-200",
                    !answer.isCorrect &&
                      answer.id ===
                        chapterQuizResponse?.response[0].quizUserResponse.find(
                          (r) => r.questionId === question.id
                        )?.answerId &&
                      "bg-[#fdb9b9]",
                    "flex items-center rounded-md px-3 py-3 transition-all duration-100"
                  )}
                  key={answer.id}
                >
                  {qNo[index]}.
                  <span className="truncate">{answer.answerText}</span>
                  {answer.isCorrect && (
                    <div className="ml-2 rounded-md bg-green-600 px-2 py-1 text-sm text-white">
                      Correct Answer
                    </div>
                  )}
                  {answer.id ===
                    chapterQuizResponse?.response[0].quizUserResponse.find(
                      (r) => r.questionId === question.id
                    )?.answerId && (
                    <div className="ml-2 rounded-md bg-fuchsia-600 px-2 py-1 text-sm text-white">
                      Your Selection
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterQuizResponseNew;
