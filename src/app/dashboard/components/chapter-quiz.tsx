import { useEffect } from "react";

import { Check, Loader2, X } from "lucide-react";
import useSWR from "swr";

import useQuizDataStore from "@/store/quiz-data";

import ChapterQuizForm from "./chapter-quiz-form";
import DeleteQuiz from "./quiz-delete";
import QuizEdit from "./quiz-edit";

// fetch all questions

interface Props {
  moduleId: string;
  courseId: string;
  chapterSlug: string;
}

export type QData = {
  id: string;
  chapterId: string;
  courseId: string;
  duration: number;
  status: "draft" | "published" | "archived" | "deleted";
  createdAt: string;
  questions: {
    id: string;
    quizId: string;
    questionText: string;
    type: null;
    answers: {
      id: string;
      questionId: string;
      answerText: string;
      isCorrect: boolean;
    }[];
  }[];
};
const ChapterQuiz = ({ moduleId, courseId, chapterSlug }: Props) => {
  const qNo = ["a", "b", "c", "d"];

  const { setQuestionLength } = useQuizDataStore();

  const fetcher = () =>
    fetch(
      `/api/chapters/quiz/questions?moduleId=${moduleId}&courseId=${courseId}&chapterSlug=${chapterSlug}`
    ).then((res) => res.json());

  const { data, isLoading } = useSWR<QData, boolean>("questions", fetcher);

  useEffect(() => {
    if (data && data?.questions) {
      setQuestionLength(Number(data?.questions.length));
    }
  }, [data, setQuestionLength]);

  return (
    <div className="my-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Create Quiz</h3>

        <ChapterQuizForm
          moduleId={moduleId}
          courseId={courseId}
          chapterSlug={chapterSlug}
        />
      </div>
      {data?.questions ? (
        <>
          <h3 className="my-3 text-xl font-bold">
            {" "}
            {data?.questions.length} Questions
          </h3>
          <div className="flex flex-col gap-5">
            {data?.questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start justify-between rounded-md bg-white px-5 py-3 shadow-md"
              >
                <div className="flex w-full flex-col">
                  <h3 className="font-semibold">
                    Q{index + 1}. {question.questionText}
                  </h3>

                  <div>
                    <p className="my-3">Answer Choices</p>

                    <div className="grid grid-cols-2 grid-rows-2">
                      {question.answers.map((answer, index) => (
                        <div
                          className="flex items-center gap-3"
                          key={answer.id}
                        >
                          {qNo[index]}.
                          {answer.isCorrect ? (
                            <Check className="text-green-600" />
                          ) : (
                            <X className="text-red-600" />
                          )}
                          <span className="truncate">{answer.answerText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <QuizEdit
                    questionId={question.id}
                    quizId={data.id}
                    quizQuestion={question.questionText}
                    quesOptions={question.answers.map((answer) => ({
                      isCorrect: answer.isCorrect,
                      option: answer.answerText,
                    }))}
                  />
                  <DeleteQuiz questionId={question.id} quizId={data.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {isLoading && (
            <>
              <Loader2 className="mx-auto mb-3 mt-10 animate-spin" />
              <p className="text-center">Loading Quiz Data...</p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChapterQuiz;
