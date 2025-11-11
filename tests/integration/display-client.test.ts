import { describe, it, expect } from "vitest";
import { setupIntegrationTest, testPrisma } from "@/tests/setup";
import { validateDisplayToken } from "@/lib/auth";

setupIntegrationTest();

describe("Display Client Integration Tests", () => {
  describe("Display Token Authentication", () => {
    it("should validate a display token format", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "abcdefghijklmnopqrstuvwxyz123456", // Exactly 32 characters
        },
      });

      expect(validateDisplayToken(display.token)).toBe(true);
    });

    it("should find display by valid token", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "validtoken1234567890123456789012",
        },
      });

      const found = await testPrisma.display.findUnique({
        where: { token: display.token },
      });

      expect(found).toBeDefined();
      expect(found?.id).toBe(display.id);
      expect(found?.name).toBe("Test Display");
    });

    it("should return null for invalid token", async () => {
      const found = await testPrisma.display.findUnique({
        where: { token: "nonexistent-token-123456789012" },
      });

      expect(found).toBeNull();
    });

    it("should update lastSeenAt when display connects", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "testtoken12345678901234567890123",
        },
      });

      expect(display.lastSeenAt).toBeNull();

      const now = new Date();
      const updated = await testPrisma.display.update({
        where: { id: display.id },
        data: { lastSeenAt: now },
      });

      expect(updated.lastSeenAt).toEqual(now);
    });

    it("should retrieve display with playlist and videos", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "testtoken12345678901234567890123",
        },
      });

      const playlist = await testPrisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: "SEQUENCE",
        },
      });

      const video1 = await testPrisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      const video2 = await testPrisma.video.create({
        data: {
          title: "Video 2",
          blobUrl: "https://example.com/video2.mp4",
          mimeType: "video/mp4",
        },
      });

      await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video1.id, position: 0 },
      });

      await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video2.id, position: 1 },
      });

      const result = await testPrisma.display.findUnique({
        where: { token: display.token },
        include: {
          playlist: {
            include: {
              items: {
                include: { video: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.playlist).toBeDefined();
      expect(result?.playlist?.items).toHaveLength(2);
      expect(result?.playlist?.items[0].video.title).toBe("Video 1");
      expect(result?.playlist?.items[1].video.title).toBe("Video 2");
      expect(result?.playlist?.playbackMode).toBe("SEQUENCE");
    });

    it("should handle display with no playlist", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "testtoken12345678901234567890123",
        },
      });

      const result = await testPrisma.display.findUnique({
        where: { token: display.token },
        include: {
          playlist: {
            include: {
              items: {
                include: { video: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.playlist).toBeNull();
    });

    it("should handle inactive displays", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Inactive Display",
          token: "inactivetoken1234567890123456789",
          isActive: false,
        },
      });

      const found = await testPrisma.display.findUnique({
        where: { token: display.token },
      });

      expect(found).toBeDefined();
      expect(found?.isActive).toBe(false);
    });

    it("should only return active playlist items", async () => {
      const display = await testPrisma.display.create({
        data: {
          name: "Test Display",
          token: "testtoken12345678901234567890123",
        },
      });

      const activePlaylist = await testPrisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: "LOOP",
          isActive: true,
        },
      });

      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      await testPrisma.playlistItem.create({
        data: { playlistId: activePlaylist.id, videoId: video.id, position: 0 },
      });

      const result = await testPrisma.display.findUnique({
        where: { token: display.token },
        include: {
          playlist: {
            where: { isActive: true },
            include: {
              items: {
                include: { video: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      expect(result?.playlist).toBeDefined();
      expect(result?.playlist?.isActive).toBe(true);
    });
  });
});
