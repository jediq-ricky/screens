"use client";

import { useState } from "react";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlist: (Playlist & {
    items: (PlaylistItem & {
      video: Video;
    })[];
  }) | null;
};

interface PlaylistEditorProps {
  display: DisplayWithPlaylist;
  availableVideos: Video[];
}

export default function PlaylistEditor({ display, availableVideos }: PlaylistEditorProps) {
  const [playlist, setPlaylist] = useState(display.playlist);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlaylist = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayId: display.id,
          playbackMode: "SEQUENCE",
        }),
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylist({ ...newPlaylist, items: [] });
      }
    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddVideo = async (videoId: string) => {
    if (!playlist) return;

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (response.ok) {
        const newItem = await response.json();
        const video = availableVideos.find((v) => v.id === videoId);
        if (video) {
          setPlaylist({
            ...playlist,
            items: [...(playlist.items || []), { ...newItem, video }],
          });
        }
      }
    } catch (error) {
      console.error("Failed to add video to playlist:", error);
    }
  };

  const handleRemoveVideo = async (itemId: string) => {
    if (!playlist) return;

    try {
      const response = await fetch(`/api/playlists/${playlist.id}/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPlaylist({
          ...playlist,
          items: playlist.items.filter((item) => item.id !== itemId),
        });
      }
    } catch (error) {
      console.error("Failed to remove video from playlist:", error);
    }
  };

  const handleChangePlaybackMode = async (mode: string) => {
    if (!playlist) return;

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbackMode: mode }),
      });

      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist({ ...playlist, playbackMode: updatedPlaylist.playbackMode });
      }
    } catch (error) {
      console.error("Failed to update playback mode:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;

    if (!confirm("Are you sure you want to delete this playlist? All playlist items will be removed.")) {
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete playlist");
      }

      // Reset playlist state
      setPlaylist(null);
    } catch (error) {
      alert("Failed to delete playlist. Please try again.");
    }
  };

  const videoIdsInPlaylist = new Set(playlist?.items?.map((item) => item.videoId) || []);
  const availableToAdd = availableVideos.filter((v) => !videoIdsInPlaylist.has(v.id));

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{display.name}</h2>
        {display.description && (
          <p className="text-gray-600 mb-4">{display.description}</p>
        )}

        {!playlist ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No playlist configured for this display</p>
            <button
              onClick={handleCreatePlaylist}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label htmlFor="playback-mode" className="block text-sm font-medium text-gray-700 mb-2">
                  Playback Mode
                </label>
                <select
                  id="playback-mode"
                  aria-label="Playback Mode"
                  value={playlist.playbackMode}
                  onChange={(e) => handleChangePlaybackMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SEQUENCE">Sequence</option>
                  <option value="LOOP">Loop</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
              <div className="pt-7">
                <button
                  onClick={handleDeletePlaylist}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete Playlist
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Playlist Items</h3>
              {playlist.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No videos in playlist</p>
              ) : (
                <div className="space-y-2">
                  {playlist.items
                    .sort((a, b) => a.position - b.position)
                    .map((item, index) => (
                      <div
                        key={item.id}
                        data-testid={`playlist-item-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500 w-8">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{item.video.title}</p>
                            {item.video.description && (
                              <p className="text-sm text-gray-500">{item.video.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveVideo(item.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {playlist && availableToAdd.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Videos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableToAdd.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{video.title}</p>
                  {video.description && (
                    <p className="text-sm text-gray-500">{video.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAddVideo(video.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
