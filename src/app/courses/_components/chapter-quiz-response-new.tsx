import { cn } from "@/lib/utils";
import React from "react";

type Props =
  | {
      courseId: string;
      chapterId: string;
      id: string;
      isPublished: boolean | null;
      duration: number;
      createdAt: string;
      response: {
        courseId: string;
        id: string;
        duration: number;
        createdAt: string;
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
    <div className="flex  gap-5 flex-col">
      {chapterQuizResponse!.questions.map((question, index) => (
        <div
          key={question.id}
          className="flex flex-col shadow-md bg-white rounded-md px-5 py-3"
        >
          <h3 className="font-semibold">
            Q{index + 1}. {question.questionText}
          </h3>

          <div>
            <p className="my-3">Answer Choices</p>

            <div className="grid grid-cols-2 gap-5 grid-rows-2">
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
                    " rounded-md transition-all duration-100  flex items-center px-3 py-3"
                  )}
                  key={answer.id}
                >
                  {qNo[index]}. {answer.answerText}
                  {answer.isCorrect && (
                    <div className="text-sm ml-2  rounded-md px-2 py-1 bg-green-600 text-white">
                      Correct Answer
                    </div>
                  )}
                  {answer.id ===
                    chapterQuizResponse?.response[0].quizUserResponse.find(
                      (r) => r.questionId === question.id
                    )?.answerId && (
                    <div className="text-sm ml-2  rounded-md px-2 py-1 bg-fuchsia-600 text-white">
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
