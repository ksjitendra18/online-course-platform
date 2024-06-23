"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface VideoPlayerProps {
  playbackId: string;
  autoPlay: boolean;
  userId?: string;
  courseId: string;
  chapterId?: string;
  isEnrolled: boolean;
}

const VideoPlayerWithProgress: React.FC<VideoPlayerProps> = ({
  playbackId,
  autoPlay,
  userId,
  chapterId,
  isEnrolled,
  courseId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleStartLoad = () => {
    setIsLoading(true);
  };
  const router = useRouter();
  const handleOnLoad = () => {
    setIsLoading(false);
  };

  // useEffect(() => {
  //   const player = new (window as any).playerjs.Player(
  //     document.getElementById("bunny-stream-embed")
  //   );

  //   player.on("ready", () => {
  //     player.on("ended", async () => {
  //       if (isEnrolled) {
  //         const res = await fetch("/api/progress", {
  //           method: "POST",
  //           body: JSON.stringify({
  //             courseId,
  //             chapterId,
  //             isCompleted: true,
  //           }),
  //         });

  //         if (res.status === 200) {
  //           toast.success("Progess Saved");
  //           router.refresh();
  //         }
  //       }
  //     });
  //   });
  // }, []);

  useEffect(() => {
    // Dynamically load the playerjs script
    const script = document.createElement("script");
    script.src =
      "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";
    script.async = true;

    script.onload = () => {
      // Once the script is loaded, create the player
      const player = new (window as any).playerjs.Player(
        document.getElementById("bunny-stream-embed")
      );

      player.on("ready", () => {
        setIsLoading(false); // Set loading to false once player is ready
        player.on("ended", async () => {
          if (isEnrolled) {
            const res = await fetch("/api/progress", {
              method: "POST",
              body: JSON.stringify({
                courseId,
                chapterId,
                isCompleted: true,
              }),
            });

            if (res.status === 200) {
              router.refresh();
              toast.success("Progress Saved");
            }
          }
        });
      });
    };

    // Append the script to the document body
    document.body.appendChild(script);

    // Clean up: remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="h-full flex items-center justify-center w-full bg-red-800">
          <Loader2 size={30} />
        </div>
      ) : (
        <>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              paddingTop: "56.25%",
            }}
          >
            <iframe
              src={`https://iframe.mediadelivery.net/embed/185611/${playbackId}?autoplay=${autoPlay}&loop=false&muted=false&preload=true`}
              loading="lazy"
              id="bunny-stream-embed"
              onLoadStart={handleStartLoad}
              onLoadedData={handleStartLoad}
              onLoad={handleOnLoad}
              style={{
                border: 0,
                position: "absolute",
                top: 0,
                height: "100%",
                width: "100%",
              }}
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
              allowFullScreen
            ></iframe>
          </div>
        </>
      )}
    </>
  );
};

export default VideoPlayerWithProgress;
