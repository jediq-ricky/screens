"use client";

import { useState, useEffect, useRef } from "react";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";
import { useSSE } from "@/lib/hooks/useSSE";

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

export default function DisplayClient({ display: initialDisplay }: DisplayClientProps) {
  const [display, setDisplay] = useState(initialDisplay);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInGap, setIsInGap] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videos = display.playlist?.items.map((item) => item.video) || [];
  const hasVideos = videos.length > 0;
  const playbackMode = display.playlist?.playbackMode;

  // Connect to SSE for real-time updates
  const { isConnected, addEventListener, removeEventListener } = useSSE({
    url: `/api/sse?displayId=${display.id}`,
    onMessage: (event) => {
      console.log("SSE message:", event.data);
    },
    onError: (error) => {
      console.error("SSE error:", error);
    },
    reconnect: true,
    reconnectInterval: 5000,
  });

  // Listen for control commands
  useEffect(() => {
    const handleControl = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.command === "play" && videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        } else if (data.command === "pause" && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else if (data.command === "next") {
          handleNext();
        } else if (data.command === "previous") {
          handlePrevious();
        } else if (data.command === "skip" && typeof data.index === "number") {
          setCurrentVideoIndex(data.index);
        }
      } catch (error) {
        console.error("Error handling control command:", error);
      }
    };

    addEventListener("control", handleControl);
    return () => removeEventListener("control", handleControl);
  }, [addEventListener, removeEventListener, videos.length]);

  // Listen for playlist updates
  useEffect(() => {
    const handlePlaylistUpdate = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Playlist updated, fetching new data...", data);

        const previousVideoCount = videos.length;

        // Fetch updated playlist data
        const response = await fetch(`/api/displays/${display.id}/playlist/data`);
        if (response.ok) {
          const { playlist } = await response.json();
          const newVideoCount = playlist?.items?.length || 0;

          console.log("Previous video count:", previousVideoCount, "New video count:", newVideoCount);

          setDisplay((prev) => ({ ...prev, playlist }));

          // Reset to first video if current index is out of bounds
          setCurrentVideoIndex((prevIndex) => {
            return prevIndex >= newVideoCount ? 0 : prevIndex;
          });

          // If we went from no videos to having videos, trigger play
          if (previousVideoCount === 0 && newVideoCount > 0) {
            console.log("First video added, will auto-play in 500ms");
            // Wait for video element to mount
            setTimeout(() => {
              console.log("Attempting to play video, ref exists:", !!videoRef.current);
              if (videoRef.current) {
                videoRef.current.play().catch((error) => {
                  console.error("Error auto-playing after playlist update:", error);
                });
              }
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error handling playlist update:", error);
      }
    };

    addEventListener("playlist-updated", handlePlaylistUpdate);
    return () => removeEventListener("playlist-updated", handlePlaylistUpdate);
  }, [addEventListener, removeEventListener, display.id, videos.length]);

  // Listen for display settings updates
  useEffect(() => {
    const handleDisplayUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Update display settings (like showControls)
        if (data.showControls !== undefined) {
          setDisplay((prev) => ({ ...prev, showControls: data.showControls }));
        }
      } catch (error) {
        console.error("Error handling display update:", error);
      }
    };

    addEventListener("display-updated", handleDisplayUpdate);
    return () => removeEventListener("display-updated", handleDisplayUpdate);
  }, [addEventListener, removeEventListener, display.showControls]);

  // Send playback status updates
  useEffect(() => {
    if (!hasVideos) return;

    const sendStatus = async () => {
      try {
        await fetch(`/api/displays/${display.id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentVideoIndex,
            currentVideoId: videos[currentVideoIndex]?.id,
            isPlaying,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to send status update:", error);
      }
    };

    // Send status immediately when state changes
    sendStatus();

    // Also send status every 10 seconds as a heartbeat
    const interval = setInterval(sendStatus, 10000);
    return () => clearInterval(interval);
  }, [display.id, currentVideoIndex, isPlaying, hasVideos, videos]);

  const handleNext = () => {
    const videoGap = (display.playlist?.videoGap || 0) * 1000; // Convert to milliseconds

    const advance = () => {
      if (playbackMode === "SEQUENCE") {
        if (currentVideoIndex < videos.length - 1) {
          setCurrentVideoIndex(currentVideoIndex + 1);
        }
      } else if (playbackMode === "LOOP") {
        setCurrentVideoIndex((currentVideoIndex + 1) % videos.length);
      }
    };

    if (videoGap > 0) {
      // Mark as paused and in gap (will show black screen)
      setIsPlaying(false);
      setIsInGap(true);
      setTimeout(() => {
        setIsInGap(false);
        advance();
      }, videoGap);
    } else {
      advance();
    }
  };

  const handlePrevious = () => {
    const videoGap = (display.playlist?.videoGap || 0) * 1000; // Convert to milliseconds

    const goBack = () => {
      if (currentVideoIndex > 0) {
        setCurrentVideoIndex(currentVideoIndex - 1);
      } else if (playbackMode === "LOOP") {
        setCurrentVideoIndex(videos.length - 1);
      }
    };

    if (videoGap > 0) {
      // Mark as paused and in gap (will show black screen)
      setIsPlaying(false);
      setIsInGap(true);
      setTimeout(() => {
        setIsInGap(false);
        goBack();
      }, videoGap);
    } else {
      goBack();
    }
  };

  // Ensure video plays when index changes and immediately mark as playing
  useEffect(() => {
    if (videoRef.current && hasVideos) {
      // Immediately mark as playing when video index changes (will auto-play)
      setIsPlaying(true);
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    }
  }, [currentVideoIndex, hasVideos]);

  // Track actual video play/pause state (only for user-initiated actions)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white ${display.showControls ? 'border-8 border-white' : ''}`}>
      {/* White border overlay - only show if showControls is true */}
      {display.showControls && (
        <div className="absolute inset-0 pointer-events-none z-50 border-8 border-white" />
      )}

      {/* Status Bar - only show if showControls is true */}
      {display.showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-black p-4">
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
      )}

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
          <div className="w-full h-screen relative">
            <video
              ref={videoRef}
              key={videos[currentVideoIndex].id}
              className={`w-full h-full object-contain transition-opacity duration-500 ${
                isInGap ? "opacity-0" : "opacity-100"
              }`}
              src={videos[currentVideoIndex].blobUrl}
              autoPlay
              muted
              playsInline
              loop={playbackMode === "LOOP" && videos.length === 1}
              data-testid="video-player"
              onEnded={handleNext}
            >
              <source
                src={videos[currentVideoIndex].blobUrl}
                type={videos[currentVideoIndex].mimeType}
              />
              Your browser does not support the video tag.
            </video>
            {isInGap && (
              <div className="absolute inset-0 bg-black" />
            )}
          </div>
        )}
      </div>

      {/* Debug Info (only in development and when showControls is true) */}
      {process.env.NODE_ENV === "development" && hasVideos && display.showControls && (
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
