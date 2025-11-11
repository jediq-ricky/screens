"use client";

import { useState } from "react";
import Link from "next/link";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlist: (Playlist & {
    items: (PlaylistItem & {
      video: Video;
    })[];
  }) | null;
};

interface DisplayManagerProps {
  initialDisplays: DisplayWithPlaylist[];
}

export default function DisplayManager({ initialDisplays }: DisplayManagerProps) {
  const [displays, setDisplays] = useState(initialDisplays);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDisplayDescription, setNewDisplayDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDisplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/displays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDisplayName,
          description: newDisplayDescription || undefined,
        }),
      });

      if (response.ok) {
        const newDisplay = await response.json();
        setDisplays([{ ...newDisplay, playlist: null }, ...displays]);
        setNewDisplayName("");
        setNewDisplayDescription("");
        setShowNewForm(false);
      }
    } catch (error) {
      console.error("Failed to create display:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {/* Create New Display Button */}
      {!showNewForm && (
        <button
          onClick={() => setShowNewForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Display
        </button>
      )}

      {/* New Display Form */}
      {showNewForm && (
        <form
          onSubmit={handleCreateDisplay}
          className="mb-6 p-6 bg-white rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Register New Display</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lobby Display"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newDisplayDescription}
                onChange={(e) => setNewDisplayDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isCreating ? "Creating..." : "Create Display"}
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Display List */}
      {displays.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No displays registered</p>
          <p className="text-gray-400 mt-2">Create your first display to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displays.map((display) => (
            <div
              key={display.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {display.name}
                  </h3>
                  {display.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {display.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    display.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {display.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Display URL:</span>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/display/${display.token}`
                      : `/display/${display.token}`}
                  </p>
                </div>

                {display.playlist && (
                  <div className="text-sm">
                    <span className="text-gray-500">
                      Playlist: {display.playlist.items.length} videos
                    </span>
                  </div>
                )}

                {display.lastSeenAt && (
                  <div className="text-sm text-gray-500">
                    Last seen: {new Date(display.lastSeenAt).toLocaleString()}
                  </div>
                )}

                <Link
                  href={`/controller/playlists/${display.id}`}
                  className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Configure Playlist
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
