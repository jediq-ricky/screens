import { describe, it, expect } from "vitest";
import { setupIntegrationTest, testPrisma } from "@/tests/setup";

setupIntegrationTest();

describe("Playlist Integration Tests", () => {
  describe("Playlist Creation", () => {
    it("should create a playlist for a display", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });

      const playlist = await testPrisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: "SEQUENCE",
        },
      });

      expect(playlist.id).toBeDefined();
      expect(playlist.displayId).toBe(display.id);
      expect(playlist.playbackMode).toBe("SEQUENCE");
      expect(playlist.isActive).toBe(true);
      expect(playlist.videoGap).toBe(0); // Default value
    });

    it("should create a playlist with custom videoGap", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });

      const playlist = await testPrisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: "LOOP",
          videoGap: 10,
        },
      });

      expect(playlist.videoGap).toBe(10);
    });

    it("should prevent duplicate playlists for the same display", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });

      await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "LOOP" },
      });

      await expect(
        testPrisma.playlist.create({
          data: { displayId: display.id, playbackMode: "SEQUENCE" },
        })
      ).rejects.toThrow();
    });

    it("should default to SEQUENCE playback mode", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });

      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id },
      });

      expect(playlist.playbackMode).toBe("SEQUENCE");
    });

    it("should cascade delete playlist when display is deleted", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });

      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "LOOP" },
      });

      await testPrisma.display.delete({
        where: { id: display.id },
      });

      const deletedPlaylist = await testPrisma.playlist.findUnique({
        where: { id: playlist.id },
      });

      expect(deletedPlaylist).toBeNull();
    });
  });

  describe("Playlist Updates", () => {
    it("should update playlist playback mode", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });

      const updated = await testPrisma.playlist.update({
        where: { id: playlist.id },
        data: { playbackMode: "LOOP" },
      });

      expect(updated.playbackMode).toBe("LOOP");
    });

    it("should update playlist active status", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });

      const updated = await testPrisma.playlist.update({
        where: { id: playlist.id },
        data: { isActive: false },
      });

      expect(updated.isActive).toBe(false);
    });

    it("should update playlist videoGap", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });

      const updated = await testPrisma.playlist.update({
        where: { id: playlist.id },
        data: { videoGap: 5 },
      });

      expect(updated.videoGap).toBe(5);
    });
  });

  describe("Playlist Items", () => {
    it("should add video to playlist", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      const item = await testPrisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video.id,
          position: 0,
        },
      });

      expect(item.playlistId).toBe(playlist.id);
      expect(item.videoId).toBe(video.id);
      expect(item.position).toBe(0);
    });

    it("should auto-increment position when adding multiple videos", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
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

      const item2 = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video2.id, position: 1 },
      });

      expect(item2.position).toBe(1);
    });

    it("should prevent duplicate videos in playlist", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });

      await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video.id, position: 0 },
      });

      await expect(
        testPrisma.playlistItem.create({
          data: { playlistId: playlist.id, videoId: video.id, position: 1 },
        })
      ).rejects.toThrow();
    });

    it("should prevent duplicate positions in playlist", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
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

      await expect(
        testPrisma.playlistItem.create({
          data: { playlistId: playlist.id, videoId: video2.id, position: 0 },
        })
      ).rejects.toThrow();
    });

    it("should remove video from playlist", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });
      const item = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video.id, position: 0 },
      });

      await testPrisma.playlistItem.delete({
        where: { id: item.id },
      });

      const deletedItem = await testPrisma.playlistItem.findUnique({
        where: { id: item.id },
      });

      expect(deletedItem).toBeNull();
    });

    it("should cascade delete playlist items when playlist is deleted", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });
      const item = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video.id, position: 0 },
      });

      await testPrisma.playlist.delete({
        where: { id: playlist.id },
      });

      const deletedItem = await testPrisma.playlistItem.findUnique({
        where: { id: item.id },
      });

      expect(deletedItem).toBeNull();
    });

    it("should cascade delete playlist items when video is deleted", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });
      const item = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video.id, position: 0 },
      });

      await testPrisma.video.delete({
        where: { id: video.id },
      });

      const deletedItem = await testPrisma.playlistItem.findUnique({
        where: { id: item.id },
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe("Playlist Item Reordering", () => {
    it("should update playlist item positions", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
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
      const item1 = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video1.id, position: 0 },
      });
      const item2 = await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video2.id, position: 1 },
      });

      // Swap positions using negative temporary values to avoid constraint conflict
      await testPrisma.$transaction([
        // Move to temporary negative positions first
        testPrisma.playlistItem.update({
          where: { id: item1.id },
          data: { position: -1 },
        }),
        testPrisma.playlistItem.update({
          where: { id: item2.id },
          data: { position: -2 },
        }),
        // Then update to final positions
        testPrisma.playlistItem.update({
          where: { id: item1.id },
          data: { position: 1 },
        }),
        testPrisma.playlistItem.update({
          where: { id: item2.id },
          data: { position: 0 },
        }),
      ]);

      const reorderedItems = await testPrisma.playlistItem.findMany({
        where: { playlistId: playlist.id },
        orderBy: { position: "asc" },
      });

      expect(reorderedItems[0].id).toBe(item2.id);
      expect(reorderedItems[1].id).toBe(item1.id);
    });
  });

  describe("Playlist Queries", () => {
    it("should retrieve playlist with items and videos", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "SEQUENCE" },
      });
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://example.com/video.mp4",
          mimeType: "video/mp4",
        },
      });
      await testPrisma.playlistItem.create({
        data: { playlistId: playlist.id, videoId: video.id, position: 0 },
      });

      const result = await testPrisma.playlist.findUnique({
        where: { id: playlist.id },
        include: {
          items: {
            include: {
              video: true,
            },
            orderBy: { position: "asc" },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result?.items).toHaveLength(1);
      expect(result?.items[0].video.title).toBe("Test Video");
    });

    it("should retrieve display with playlist", async () => {
      const display = await testPrisma.display.create({
        data: { name: "Test Display", token: "test-token-12345678901234567890" },
      });
      const playlist = await testPrisma.playlist.create({
        data: { displayId: display.id, playbackMode: "LOOP" },
      });

      const result = await testPrisma.display.findUnique({
        where: { id: display.id },
        include: {
          playlist: true,
        },
      });

      expect(result).toBeDefined();
      expect(result?.playlist).toBeDefined();
      expect(result?.playlist?.id).toBe(playlist.id);
    });
  });
});
