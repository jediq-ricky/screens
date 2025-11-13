import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { uploadVideo, deleteVideo } from "@/lib/storage";
import { existsSync } from "fs";
import { readdir, unlink } from "fs/promises";
import path from "path";

describe("Video Storage", () => {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
  const testFiles: string[] = [];

  afterEach(async () => {
    // Clean up only test files created during this test
    for (const file of testFiles) {
      try {
        await unlink(path.join(uploadDir, file));
      } catch (error) {
        // Ignore if file doesn't exist
      }
    }
    testFiles.length = 0;
  });

  describe("uploadVideo", () => {
    it("should upload a video buffer and return URL and size", async () => {
      const mockBuffer = Buffer.from("test content");
      const result = await uploadVideo(mockBuffer, "test.mp4");

      expect(result.url).toMatch(/^\/uploads\/videos\/\d+-[a-z0-9]+-test\.mp4$/);
      expect(result.size).toBe(mockBuffer.length);

      // Verify file was written
      const filename = result.url.split("/").pop()!;
      testFiles.push(filename);
      expect(existsSync(path.join(uploadDir, filename))).toBe(true);
    });

    it("should sanitize filenames", async () => {
      const mockBuffer = Buffer.from("test");
      const result = await uploadVideo(mockBuffer, "test file (1).mp4");

      const filename = result.url.split("/").pop()!;
      testFiles.push(filename);
      expect(result.url).toMatch(/^\/uploads\/videos\/\d+-[a-z0-9]+-test_file__1_\.mp4$/);
    });

    it("should create unique filenames using timestamp", async () => {
      const mockBuffer = Buffer.from("test");

      const result1 = await uploadVideo(mockBuffer, "test.mp4");
      const result2 = await uploadVideo(mockBuffer, "test.mp4");

      testFiles.push(result1.url.split("/").pop()!);
      testFiles.push(result2.url.split("/").pop()!);

      expect(result1.url).not.toBe(result2.url);

      const files = await readdir(uploadDir);
      expect(files.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("deleteVideo", () => {
    it("should delete a video from local storage", async () => {
      // First upload a file
      const mockBuffer = Buffer.from("test content");
      const { url } = await uploadVideo(mockBuffer, "test.mp4");
      const filename = url.split("/").pop()!;
      testFiles.push(filename);

      // Verify file exists
      expect(existsSync(path.join(uploadDir, filename))).toBe(true);

      // Delete the file
      await deleteVideo(url);

      // Verify file was deleted
      expect(existsSync(path.join(uploadDir, filename))).toBe(false);

      // Remove from testFiles since it's already deleted
      const index = testFiles.indexOf(filename);
      if (index > -1) testFiles.splice(index, 1);
    });

    it("should not throw error if file does not exist", async () => {
      await expect(
        deleteVideo("/uploads/videos/nonexistent.mp4")
      ).resolves.not.toThrow();
    });
  });
});
