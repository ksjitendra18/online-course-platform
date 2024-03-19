"use client";

import { Loader2 } from "lucide-react";
import React, { useState } from "react";

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleStartLoad = () => {
    setIsLoading(true);
  };
  const handleOnLoad = () => {
    setIsLoading(false);
  };
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
              src={`https://iframe.mediadelivery.net/embed/185611/${videoId}?autoplay=true&loop=false&muted=false&preload=true`}
              loading="lazy"
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

export default VideoPlayer;
