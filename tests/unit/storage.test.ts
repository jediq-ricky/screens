import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadVideo, deleteVideo, listVideos } from "@/lib/storage";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  del: vi.fn(),
  list: vi.fn(),
}));

const { put, del, list } = await import("@vercel/blob");

describe("Video Storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
  });

  describe("uploadVideo", () => {
    it("should upload a video file and return URL and size", async () => {
      const mockFile = new File(["test content"], "test.mp4", {
        type: "video/mp4",
      });

      vi.mocked(put).mockResolvedValue({
        url: "https://blob.vercel-storage.com/test.mp4",
        size: 1024,
        uploadedAt: new Date(),
        pathname: "test.mp4",
        contentType: "video/mp4",
        contentDisposition: "inline",
      });

      const result = await uploadVideo(mockFile, "test.mp4");

      expect(put).toHaveBeenCalledWith("test.mp4", mockFile, {
        access: "public",
        token: "test-token",
      });

      expect(result.url).toBe("https://blob.vercel-storage.com/test.mp4");
      expect(result.size).toBe(1024);
    });

    it("should throw error if BLOB_READ_WRITE_TOKEN is not configured", async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      const mockFile = new File(["test content"], "test.mp4", {
        type: "video/mp4",
      });

      await expect(uploadVideo(mockFile, "test.mp4")).rejects.toThrow(
        "BLOB_READ_WRITE_TOKEN is not configured"
      );
    });

    it("should handle Buffer input", async () => {
      const mockBuffer = Buffer.from("test content");

      vi.mocked(put).mockResolvedValue({
        url: "https://blob.vercel-storage.com/test.mp4",
        size: 1024,
        uploadedAt: new Date(),
        pathname: "test.mp4",
        contentType: "video/mp4",
        contentDisposition: "inline",
      });

      const result = await uploadVideo(mockBuffer, "test.mp4");

      expect(put).toHaveBeenCalledWith("test.mp4", mockBuffer, {
        access: "public",
        token: "test-token",
      });

      expect(result.url).toBe("https://blob.vercel-storage.com/test.mp4");
    });
  });

  describe("deleteVideo", () => {
    it("should delete a video from blob storage", async () => {
      vi.mocked(del).mockResolvedValue(undefined);

      const url = "https://blob.vercel-storage.com/test.mp4";
      await deleteVideo(url);

      expect(del).toHaveBeenCalledWith(url, {
        token: "test-token",
      });
    });

    it("should throw error if BLOB_READ_WRITE_TOKEN is not configured", async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      await expect(
        deleteVideo("https://blob.vercel-storage.com/test.mp4")
      ).rejects.toThrow("BLOB_READ_WRITE_TOKEN is not configured");
    });
  });

  describe("listVideos", () => {
    it("should list all videos in blob storage", async () => {
      const mockBlobs = [
        {
          url: "https://blob.vercel-storage.com/video1.mp4",
          pathname: "video1.mp4",
          size: 1024,
          uploadedAt: new Date(),
          contentType: "video/mp4",
          contentDisposition: "inline",
        },
        {
          url: "https://blob.vercel-storage.com/video2.mp4",
          pathname: "video2.mp4",
          size: 2048,
          uploadedAt: new Date(),
          contentType: "video/mp4",
          contentDisposition: "inline",
        },
      ];

      vi.mocked(list).mockResolvedValue({
        blobs: mockBlobs,
        cursor: undefined,
        hasMore: false,
      });

      const result = await listVideos();

      expect(list).toHaveBeenCalledWith({
        token: "test-token",
      });

      expect(result).toEqual(mockBlobs);
      expect(result).toHaveLength(2);
    });

    it("should throw error if BLOB_READ_WRITE_TOKEN is not configured", async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      await expect(listVideos()).rejects.toThrow(
        "BLOB_READ_WRITE_TOKEN is not configured"
      );
    });
  });
});
