"use client";

import { useState, FormEvent } from "react";

interface VideoUploadProps {
  onUploadComplete: (video: any) => void;
}

export default function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file || !title) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);

      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const video = await response.json();

      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");

      onUploadComplete(video);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="video-file" className="block text-sm font-medium mb-2">
          Video File
        </label>
        <input
          id="video-file"
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="video-title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="video-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          disabled={isUploading}
        />
      </div>

      <div>
        <label htmlFor="video-description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="video-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {isUploading && (
        <div className="text-blue-600 text-sm">Uploading...</div>
      )}

      <button
        type="submit"
        disabled={!file || !title || isUploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Upload
      </button>
    </form>
  );
}
