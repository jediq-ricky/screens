"use client";

import { useState } from "react";
import type { Video } from "@/lib/generated/prisma";
import VideoUpload from "./VideoUpload";

interface VideoLibraryProps {
  initialVideos: Video[];
}

export default function VideoLibrary({ initialVideos }: VideoLibraryProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadComplete = (video: Video) => {
    setVideos([video, ...videos]);
    setShowUpload(false);
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      // Remove from state
      setVideos(videos.filter((v) => v.id !== videoId));
    } catch (error) {
      alert("Failed to delete video. Please try again.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showUpload ? "Cancel" : "Upload Video"}
        </button>
      </div>

      {showUpload && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
          <VideoUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 mt-2">Upload your first video to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {video.duration
                      ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, "0")}`
                      : "—"}
                  </span>
                  <span>
                    {video.fileSize
                      ? `${(video.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : "—"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
