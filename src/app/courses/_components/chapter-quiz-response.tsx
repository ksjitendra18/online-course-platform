import { cn } from "@/lib/utils";

interface Props {
  // userResponse: any[];

  userResponse: {
    id: string;
    createdAt: string | null;
    courseId: string;
    userId: string;
    duration: number;
    quizId: string;
    quizUserResponse: {
      id: string;
      questionId: string;
      quizResponseId: string;

      answerId: string;
      question: {
        type: "single_select" | "multi_select" | "true_false" | null;
        id: string;
        quizId: string;
        questionText: string;
        answers: {
          id: string;
          questionId: string;
          answerText: string;
          isCorrect: boolean;
        }[];
      };
      answer: {
        id: string;
        questionId: string;
        answerText: string;
        isCorrect: boolean;
      };
    }[];
  };
}

const ChapterQuizResponse = ({ userResponse }: Props) => {
  const qNo = ["a", "b", "c", "d"];

  return (
    <div className="flex flex-col gap-5">
      {userResponse.quizUserResponse.map((userResponse, index) => (
        <div
          key={userResponse.id}
          className="flex flex-col rounded-md bg-white px-5 py-3 shadow-md"
        >
          <h3 className="font-semibold">
            Q{index + 1}. {userResponse.question.questionText}
            {/* {userResponse.answerId === userResponse.question.answers.find(res => res.)} */}
          </h3>

          <div>
            <p className="my-3">Answer Choices</p>

            <div className="grid grid-cols-2 grid-rows-2 gap-5">
              {userResponse.question.answers.map((answer, index) => (
                <button
                  className={cn(
                    answer.isCorrect && answer.id === userResponse.answerId
                      ? "bg-[#a2ffa2]"
                      : "bg-slate-200",
                    !answer.isCorrect &&
                      answer.id === userResponse.answerId &&
                      "bg-[#fdb9b9]",
                    "flex items-center rounded-md px-3 py-3 transition-all duration-100"
                  )}
                  key={answer.id}
                >
                  {qNo[index]}. {answer.answerText}{" "}
                  {answer.isCorrect && (
                    <div className="ml-2 rounded-md bg-green-600 px-2 py-1 text-sm text-white">
                      Correct Answer
                    </div>
                  )}
                  {answer.id === userResponse.answerId && (
                    <div className="ml-2 rounded-md bg-fuchsia-600 px-2 py-1 text-sm text-white">
                      Your Selection
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterQuizResponse;
