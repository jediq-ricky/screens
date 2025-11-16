"use client";

import { useState, useEffect } from "react";
import type { Display, Playlist, PlaylistItem, Video, TriggerType } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlists: Array<{
    playlist: Playlist & {
      items: (PlaylistItem & {
        video: Video;
      })[];
    };
  }>;
};

interface TriggerControllerProps {
  display: DisplayWithPlaylist;
}

export default function TriggerController({ display }: TriggerControllerProps) {
  const [isListening, setIsListening] = useState(false);

  const playlist = display.playlists[0]?.playlist;
  const playlistItems = playlist?.items || [];

  // Check if this is a MANUAL playlist
  if (!playlist || playlist.playbackMode !== "MANUAL") {
    return null;
  }

  // Group items by trigger type
  const itemsByTrigger: Record<TriggerType, PlaylistItem[]> = {
    NONE: [],
    KEYBOARD: [],
    CLICK: [],
    WEBCAM: [],
    MICROPHONE: [],
  };

  playlistItems.forEach((item) => {
    if (item.triggerType) {
      itemsByTrigger[item.triggerType].push(item);
    }
  });

  const handleTriggerVideo = async (itemId: string, videoTitle: string) => {
    try {
      // Find the item index
      const index = playlistItems.findIndex((item) => item.id === itemId);
      if (index === -1) return;

      // Send control command to display
      const response = await fetch(`/api/displays/${display.id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "skip",
          index,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to trigger video");
      }

      console.log(`Triggered: ${videoTitle}`);
    } catch (error) {
      console.error("Error triggering video:", error);
      alert("Failed to trigger video");
    }
  };

  const startKeyboardListener = () => {
    setIsListening(true);
    const handleKeyPress = (event: KeyboardEvent) => {
      // Find matching keyboard trigger
      const matchingItem = playlistItems.find((item) => {
        if (item.triggerType === "KEYBOARD" && item.triggerConfig) {
          const config = item.triggerConfig as { key?: string };
          return config.key === event.key;
        }
        return false;
      });

      if (matchingItem) {
        handleTriggerVideo(matchingItem.id, matchingItem.video.title);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      setIsListening(false);
    };
  };

  useEffect(() => {
    if (isListening) {
      return startKeyboardListener();
    }
  }, [isListening, playlistItems]);

  const getTriggerLabel = (item: PlaylistItem) => {
    const config = item.triggerConfig as Record<string, unknown> | null;

    switch (item.triggerType) {
      case "KEYBOARD":
        return `Key: ${config?.key || "?"}`;
      case "CLICK":
        return config?.x && config?.y
          ? `Click at (${config.x}, ${config.y})`
          : "Click anywhere";
      case "WEBCAM":
        return `Motion (${config?.sensitivity || 50}%)`;
      case "MICROPHONE":
        return `Sound (${config?.threshold || 50}%)`;
      default:
        return "Manual";
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Triggers</h4>
        {itemsByTrigger.KEYBOARD.length > 0 && (
          <button
            onClick={() => setIsListening(!isListening)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isListening
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isListening ? "Listening..." : "Listen for Keys"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {playlistItems.map((item) => {
          if (item.triggerType === "NONE") return null;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {item.video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getTriggerLabel(item)}
                </p>
              </div>
              <button
                onClick={() => handleTriggerVideo(item.id, item.video.title)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Trigger
              </button>
            </div>
          );
        })}

        {playlistItems.every((item) => item.triggerType === "NONE") && (
          <p className="text-sm text-gray-500 text-center py-2">
            No triggers configured. Edit the playlist to add triggers.
          </p>
        )}
      </div>
    </div>
  );
}
