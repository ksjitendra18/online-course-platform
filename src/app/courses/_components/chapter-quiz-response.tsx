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
    <div className="flex  gap-5 flex-col">
      {userResponse.quizUserResponse.map((userResponse, index) => (
        <div
          key={userResponse.id}
          className="flex flex-col shadow-md bg-white rounded-md px-5 py-3"
        >
          <h3 className="font-semibold">
            Q{index + 1}. {userResponse.question.questionText}
            {/* {userResponse.answerId === userResponse.question.answers.find(res => res.)} */}
          </h3>

          <div>
            <p className="my-3">Answer Choices</p>

            <div className="grid grid-cols-2 gap-5 grid-rows-2">
              {userResponse.question.answers.map((answer, index) => (
                <button
                  className={cn(
                    answer.isCorrect && answer.id === userResponse.answerId
                      ? "bg-[#a2ffa2]"
                      : "bg-slate-200",
                    !answer.isCorrect &&
                      answer.id === userResponse.answerId &&
                      "bg-[#fdb9b9]",
                    " rounded-md transition-all duration-100  flex items-center px-3 py-3"
                  )}
                  key={answer.id}
                >
                  {qNo[index]}. {answer.answerText}{" "}
                  {answer.isCorrect && (
                    <div className="text-sm ml-2  rounded-md px-2 py-1 bg-green-600 text-white">
                      Correct Answer
                    </div>
                  )}
                  {answer.id === userResponse.answerId && (
                    <div className="text-sm ml-2  rounded-md px-2 py-1 bg-fuchsia-600 text-white">
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
