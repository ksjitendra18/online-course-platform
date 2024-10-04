"use client";

import { Button } from "@/components/ui/button";
import useQuizStore from "@/store/quiz";

import Countdown from "./countdown";

interface Props {
  duration: number;
}

const QuizDuration = ({ duration }: Props) => {
  const { setHasStarted, hasStarted, setDuration } = useQuizStore();

  return (
    <>
      {hasStarted ? (
        <Countdown durationInSeconds={duration * 60} />
      ) : (
        <Button
          onClick={() => {
            setHasStarted();
            setDuration(duration);
          }}
          className="bg-blue-600 text-white"
        >
          Start Quiz | {duration} Minutes
        </Button>
      )}
    </>
  );
};

export default QuizDuration;
