"use client";

import { useState, useEffect } from "react";
import { useSSE } from "@/lib/hooks/useSSE";
import type { Display, Playlist, PlaylistItem, Video, DisplayPlaylist } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlists: Array<DisplayPlaylist & {
    playlist: Playlist & {
      items: Array<PlaylistItem & { video: Video }>;
    };
  }>;
};

interface DisplayStatus {
  currentVideoIndex?: number;
  currentVideoId?: string;
  isPlaying?: boolean;
  timestamp?: string;
}

interface MonitorDashboardProps {
  initialDisplays: DisplayWithPlaylist[];
}

export default function MonitorDashboard({ initialDisplays }: MonitorDashboardProps) {
  const [displays, setDisplays] = useState(initialDisplays);
  const [displayStatuses, setDisplayStatuses] = useState<Record<string, DisplayStatus>>({});

  // Connect to SSE for real-time status updates
  const { isConnected, addEventListener, removeEventListener } = useSSE({
    url: "/api/sse",
    onMessage: (event) => {
      console.log("SSE message:", event.data);
    },
    onError: (error) => {
      console.error("SSE error:", error);
    },
    reconnect: true,
    reconnectInterval: 5000,
  });

  // Listen for display status updates
  useEffect(() => {
    const handleStatus = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setDisplayStatuses((prev) => ({
          ...prev,
          [data.displayId]: {
            currentVideoIndex: data.currentVideoIndex,
            currentVideoId: data.currentVideoId,
            isPlaying: data.isPlaying,
            timestamp: data.timestamp,
          },
        }));
      } catch (error) {
        console.error("Error handling status update:", error);
      }
    };

    addEventListener("display-status", handleStatus);
    return () => removeEventListener("display-status", handleStatus);
  }, [addEventListener, removeEventListener]);

  const sendControlCommand = async (displayId: string, command: string, index?: number) => {
    try {
      const response = await fetch(`/api/displays/${displayId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, index }),
      });

      if (!response.ok) {
        console.error("Failed to send control command");
      }
    } catch (error) {
      console.error("Error sending control command:", error);
    }
  };

  const isDisplayOnline = (lastSeenAt: Date) => {
    const now = Date.now();
    const lastSeen = new Date(lastSeenAt).getTime();
    const diffMinutes = (now - lastSeen) / 1000 / 60;
    return diffMinutes < 1; // Consider online if seen in last minute
  };

  const formatLastSeen = (lastSeenAt: Date) => {
    const now = Date.now();
    const lastSeen = new Date(lastSeenAt).getTime();
    const diffSeconds = Math.floor((now - lastSeen) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div>
      {/* Connection Status */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-gray-600">
          {isConnected ? "SSE Connected" : "SSE Disconnected"}
        </span>
      </div>

      {/* Display Cards */}
      {displays.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No displays configured</p>
          <p className="text-gray-400 text-sm mt-2">
            Create a display from the Displays page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displays.map((display) => {
            const status = displayStatuses[display.id];
            const playlist = display.playlists[0]?.playlist;
            const hasPlaylist = !!playlist;
            const isOnline = isDisplayOnline(display.lastSeenAt);

            return (
              <div
                key={display.id}
                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
              >
                {/* Display Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {display.name}
                    </h3>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </div>
                  {display.description && (
                    <p className="text-sm text-gray-600">{display.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Last seen: {formatLastSeen(display.lastSeenAt)}
                  </p>
                </div>

                {/* Playlist Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  {hasPlaylist ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {playlist.items.length} video{playlist.items.length !== 1 ? "s" : ""}
                        {" • "}
                        {playlist.playbackMode.toLowerCase()}
                      </p>
                      {status && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-600">
                            Video {(status.currentVideoIndex || 0) + 1} of{" "}
                            {playlist.items.length}
                          </p>
                          <p className={status.isPlaying ? "text-green-600" : "text-gray-600"}>
                            {status.isPlaying ? "▶ Playing" : "⏸ Paused"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No playlist configured</p>
                  )}
                </div>

                {/* Control Buttons */}
                {hasPlaylist && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => sendControlCommand(display.id, "play")}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      title="Play"
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => sendControlCommand(display.id, "pause")}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      title="Pause"
                    >
                      ⏸
                    </button>
                    <button
                      onClick={() => sendControlCommand(display.id, "previous")}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      title="Previous"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={() => sendControlCommand(display.id, "next")}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      title="Next"
                    >
                      ⏭
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
