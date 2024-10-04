"use client";

import Script from "next/script";
import React, { useState } from "react";

import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  playbackId: string;
  autoPlay: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playbackId, autoPlay }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleStartLoad = () => {
    setIsLoading(true);
  };
  const handleOnLoad = () => {
    setIsLoading(false);
  };
  return (
    <>
      <Script src="//assets.mediadelivery.net/playerjs/player-0.1.0.min.js" />
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-red-800">
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
