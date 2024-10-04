import { redirect } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { courseWithQuizData } from "@/db/queries/quiz";

export const metadata = {
  title: "Quiz Response",
};

type UserScores = {
  [userId: string]: {
    score: number;
    correct: number;
    incorrect: number;
  };
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

const QuizResponses = async ({ params }: { params: { slug: string } }) => {
  const courseData = await courseWithQuizData(params.slug);

  if (!courseData) {
    return redirect("/dashboard");
  }
  const userScores: UserScores = {};

  courseData.quizResponse.forEach((response) => {
    const quizUserId = `${response.quizId}_${response.userId}`;

    userScores[quizUserId] = { score: 0, correct: 0, incorrect: 0 };

    response.quizUserResponse.forEach((response) => {
      const isCorrect = response.answerId === response.question.answers[0].id;

      if (isCorrect) {
        userScores[quizUserId].score++;
        userScores[quizUserId].correct++;
      } else {
        userScores[quizUserId].incorrect++;
      }
    });
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Quiz Responses</h1>

      <div className="my-5 rounded-md border-2 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Quiz ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Correct</TableHead>
              <TableHead>Incorrect</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseData.quizResponse.map((quizResponse) => (
              <TableRow key={quizResponse.id}>
                <TableCell className="font-medium">
                  {quizResponse.quizId}
                </TableCell>

                <TableCell>{quizResponse.user.name}</TableCell>

                <TableCell>
                  {
                    userScores[`${quizResponse.quizId}_${quizResponse.userId}`]
                      .correct
                  }
                </TableCell>
                <TableCell>
                  {
                    userScores[`${quizResponse.quizId}_${quizResponse.userId}`]
                      .incorrect
                  }
                </TableCell>
                <TableCell className="text-right">
                  {
                    userScores[`${quizResponse.quizId}_${quizResponse.userId}`]
                      .score
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuizResponses;
