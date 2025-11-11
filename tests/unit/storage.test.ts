import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { uploadVideo, deleteVideo } from "@/lib/storage";
import { existsSync } from "fs";
import { readdir, unlink } from "fs/promises";
import path from "path";

describe("Video Storage", () => {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");

  afterEach(async () => {
    // Clean up test files
    if (existsSync(uploadDir)) {
      const files = await readdir(uploadDir);
      await Promise.all(
        files.map((file) => unlink(path.join(uploadDir, file)))
      );
    }
  });

  describe("uploadVideo", () => {
    it("should upload a video buffer and return URL and size", async () => {
      const mockBuffer = Buffer.from("test content");
      const result = await uploadVideo(mockBuffer, "test.mp4");

      expect(result.url).toMatch(/^\/uploads\/videos\/\d+-[a-z0-9]+-test\.mp4$/);
      expect(result.size).toBe(mockBuffer.length);

      // Verify file was written
      const filename = result.url.split("/").pop()!;
      expect(existsSync(path.join(uploadDir, filename))).toBe(true);
    });

    it("should sanitize filenames", async () => {
      const mockBuffer = Buffer.from("test");
      const result = await uploadVideo(mockBuffer, "test file (1).mp4");

      expect(result.url).toMatch(/^\/uploads\/videos\/\d+-[a-z0-9]+-test_file__1_\.mp4$/);
    });

    it("should create unique filenames using timestamp", async () => {
      const mockBuffer = Buffer.from("test");

      const result1 = await uploadVideo(mockBuffer, "test.mp4");
      const result2 = await uploadVideo(mockBuffer, "test.mp4");

      expect(result1.url).not.toBe(result2.url);

      const files = await readdir(uploadDir);
      expect(files).toHaveLength(2);
    });
  });

  describe("deleteVideo", () => {
    it("should delete a video from local storage", async () => {
      // First upload a file
      const mockBuffer = Buffer.from("test content");
      const { url } = await uploadVideo(mockBuffer, "test.mp4");

      // Verify file exists
      let files = await readdir(uploadDir);
      expect(files).toHaveLength(1);

      // Delete the file
      await deleteVideo(url);

      // Verify file was deleted
      files = await readdir(uploadDir);
      expect(files).toHaveLength(0);
    });

    it("should not throw error if file does not exist", async () => {
      await expect(
        deleteVideo("/uploads/videos/nonexistent.mp4")
      ).resolves.not.toThrow();
    });
  });
});
