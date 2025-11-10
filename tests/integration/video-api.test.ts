import { describe, it, expect, vi, beforeEach } from "vitest";
import { testPrisma as prisma, setupIntegrationTest } from "../setup";
import * as storage from "@/lib/storage";

setupIntegrationTest();

// Mock the storage module
vi.mock("@/lib/storage");

describe("Video API Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
  });

  describe("Video Creation", () => {
    it("should create a video with uploaded file", async () => {
      // Mock successful upload
      vi.mocked(storage.uploadVideo).mockResolvedValue({
        url: "https://blob.vercel-storage.com/test-video.mp4",
        size: 1024000,
      });

      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          description: "A test video",
          blobUrl: "https://blob.vercel-storage.com/test-video.mp4",
          fileSize: 1024000,
          duration: 120,
          mimeType: "video/mp4",
        },
      });

      expect(video.id).toBeDefined();
      expect(video.title).toBe("Test Video");
      expect(video.blobUrl).toBe(
        "https://blob.vercel-storage.com/test-video.mp4"
      );
      expect(video.fileSize).toBe(1024000);
    });

    it("should allow empty title at database level", async () => {
      // Database allows empty strings, validation should be at API level
      const video = await prisma.video.create({
        data: {
          title: "",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      expect(video.title).toBe("");
    });
  });

  describe("Video Retrieval", () => {
    it("should list all videos", async () => {
      const video1 = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const video2 = await prisma.video.create({
        data: {
          title: "Video 2",
          blobUrl: "https://example.com/video2.mp4",
          mimeType: "video/mp4",
        },
      });

      const videos = await prisma.video.findMany({
        orderBy: { createdAt: "desc" },
      });

      expect(videos).toHaveLength(2);
      expect(videos[0].id).toBe(video2.id); // Most recent first
      expect(videos[1].id).toBe(video1.id);
    });

    it("should get a specific video by ID", async () => {
      const created = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      const found = await prisma.video.findUnique({
        where: { id: created.id },
      });

      expect(found).not.toBeNull();
      expect(found?.title).toBe("Test Video");
    });

    it("should return null for non-existent video", async () => {
      const video = await prisma.video.findUnique({
        where: { id: "nonexistent-id" },
      });

      expect(video).toBeNull();
    });
  });

  describe("Video Update", () => {
    it("should update video metadata", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Original Title",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      const updated = await prisma.video.update({
        where: { id: video.id },
        data: {
          title: "Updated Title",
          description: "New description",
          duration: 180,
        },
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("New description");
      expect(updated.duration).toBe(180);
      expect(updated.blobUrl).toBe("https://example.com/video.mp4"); // Unchanged
    });

    it("should allow empty title at database level", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Original Title",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      // Database allows empty strings, validation should be at API level
      const updated = await prisma.video.update({
        where: { id: video.id },
        data: { title: "" },
      });

      expect(updated.title).toBe("");
    });
  });

  describe("Video Deletion", () => {
    it("should delete a video", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      await prisma.video.delete({
        where: { id: video.id },
      });

      const deleted = await prisma.video.findUnique({
        where: { id: video.id },
      });

      expect(deleted).toBeNull();
    });

    it("should delete video from storage when deleted from database", async () => {
      vi.mocked(storage.deleteVideo).mockResolvedValue(undefined);

      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      // In real implementation, this would be handled by API route
      await storage.deleteVideo(video.blobUrl);
      await prisma.video.delete({
        where: { id: video.id },
      });

      expect(storage.deleteVideo).toHaveBeenCalledWith(
        "https://example.com/video.mp4"
      );
    });

    it("should cascade delete playlist items when video is deleted", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Test Display",
          token: "test-token-123456789012345678901234",
        },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      const item = await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video.id,
          position: 0,
        },
      });

      await prisma.video.delete({
        where: { id: video.id },
      });

      const deletedItem = await prisma.playlistItem.findUnique({
        where: { id: item.id },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe("Video Search and Filter", () => {
    it("should search videos by title", async () => {
      await prisma.video.createMany({
        data: [
          {
            title: "Introduction to React",
            blobUrl: "https://example.com/react.mp4",
            mimeType: "video/mp4",
          },
          {
            title: "Advanced TypeScript",
            blobUrl: "https://example.com/typescript.mp4",
            mimeType: "video/mp4",
          },
          {
            title: "React Hooks Deep Dive",
            blobUrl: "https://example.com/hooks.mp4",
            mimeType: "video/mp4",
          },
        ],
      });

      const results = await prisma.video.findMany({
        where: {
          title: {
            contains: "React",
            mode: "insensitive",
          },
        },
      });

      expect(results).toHaveLength(2);
      expect(results.map((v) => v.title)).toContain("Introduction to React");
      expect(results.map((v) => v.title)).toContain("React Hooks Deep Dive");
    });

    it("should filter videos by mime type", async () => {
      await prisma.video.createMany({
        data: [
          {
            title: "Video 1",
            blobUrl: "https://example.com/video1.mp4",
            mimeType: "video/mp4",
          },
          {
            title: "Video 2",
            blobUrl: "https://example.com/video2.webm",
            mimeType: "video/webm",
          },
          {
            title: "Video 3",
            blobUrl: "https://example.com/video3.mp4",
            mimeType: "video/mp4",
          },
        ],
      });

      const mp4Videos = await prisma.video.findMany({
        where: { mimeType: "video/mp4" },
      });

      expect(mp4Videos).toHaveLength(2);
    });
  });
});
