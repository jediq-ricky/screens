"use client";

import { useState, useEffect } from "react";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlist: (Playlist & {
    items: (PlaylistItem & {
      video: Video;
    })[];
  }) | null;
};

interface DisplayClientProps {
  display: DisplayWithPlaylist;
}

export default function DisplayClient({ display }: DisplayClientProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const videos = display.playlist?.items.map((item) => item.video) || [];
  const hasVideos = videos.length > 0;
  const playbackMode = display.playlist?.playbackMode;

  // Simulate connection status check
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(navigator.onLine);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{display.name}</h1>
            {display.description && (
              <p className="text-sm text-gray-300">{display.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Display Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  display.isActive ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span className="text-sm">
                {display.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Connection Status */}
            <div
              className="flex items-center gap-2"
              data-testid="connection-status"
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Playlist Info */}
        {display.playlist && (
          <div className="mt-2 text-sm text-gray-300">
            <span className="capitalize">{playbackMode?.toLowerCase()}</span>
            {" • "}
            <span>{videos.length} videos in playlist</span>
            {hasVideos && (
              <>
                {" • "}
                <span>
                  Playing {currentVideoIndex + 1} of {videos.length}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        {!display.playlist ? (
          <div className="text-center">
            <p className="text-2xl text-gray-400">No playlist configured</p>
            <p className="text-gray-500 mt-2">
              Configure a playlist in the controller interface
            </p>
          </div>
        ) : !hasVideos ? (
          <div className="text-center">
            <p className="text-2xl text-gray-400">No videos in playlist</p>
            <p className="text-gray-500 mt-2">
              Add videos to the playlist in the controller interface
            </p>
          </div>
        ) : (
          <div className="w-full h-screen">
            <video
              key={videos[currentVideoIndex].id}
              className="w-full h-full object-contain"
              src={videos[currentVideoIndex].blobUrl}
              autoPlay
              muted
              playsInline
              data-testid="video-player"
              onEnded={() => {
                if (playbackMode === "SEQUENCE") {
                  if (currentVideoIndex < videos.length - 1) {
                    setCurrentVideoIndex(currentVideoIndex + 1);
                  }
                } else if (playbackMode === "LOOP") {
                  setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
                }
              }}
            >
              <source
                src={videos[currentVideoIndex].blobUrl}
                type={videos[currentVideoIndex].mimeType}
              />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && hasVideos && (
        <div className="absolute bottom-4 right-4 bg-black/80 p-4 rounded text-xs">
          <p>Current: {videos[currentVideoIndex].title}</p>
          <p>Mode: {playbackMode}</p>
          <p>
            Index: {currentVideoIndex + 1}/{videos.length}
          </p>
        </div>
      )}
    </div>
  );
}
