import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface CountdownProps {
  durationInSeconds: number;
}

const Countdown: React.FC<CountdownProps> = ({ durationInSeconds }) => {
  const calculateTimeLeft = (
    timeLeftInSeconds: number
  ): { hours: number; minutes: number; seconds: number } => {
    const hours = Math.floor(timeLeftInSeconds / 3600);
    const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
    const seconds = timeLeftInSeconds % 60;
    return { hours, minutes, seconds };
  };

  const [isTimesUp, setIsTimesUp] = useState(false);

  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState(durationInSeconds);

  useEffect(() => {
    // const timer = setInterval(() => {
    //   setTimeLeftInSeconds((prevTime) => Math.max(0, prevTime - 1));
    // }, 1000);

    const timer = setInterval(() => {
      setTimeLeftInSeconds((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        if (newTime === 0) {
          setIsTimesUp(true);
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { hours, minutes, seconds } = calculateTimeLeft(timeLeftInSeconds);

  return (
    <div>
      <div
        className={cn(
          isTimesUp ? "bg-red-600" : "bg-blue-600",
          "flex rounded-md px-2 py-2 text-white"
        )}
      >
        {isTimesUp ? (
          <>
            <h3>Times Up</h3>
          </>
        ) : (
          <>
            <h3>Time Left: </h3>

            <div className="ml-2">
              {hours > 0 && (
                <span>
                  {hours} hour{hours > 1 ? "s" : ""}{" "}
                </span>
              )}
              {minutes > 0 && (
                <span>
                  {minutes} minute{minutes > 1 ? "s" : ""}{" "}
                </span>
              )}
              {seconds > 0 && (
                <span>
                  {seconds} second{seconds > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Countdown;
