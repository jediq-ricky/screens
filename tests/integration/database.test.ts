import { describe, it, expect } from "vitest";
import { PlaybackMode } from "@/lib/generated/prisma";
import { testPrisma as prisma, setupIntegrationTest } from "../setup";

setupIntegrationTest();

describe("Database Schema Tests", () => {
  describe("Video Model", () => {
    it("should create a video with required fields", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://blob.vercel-storage.com/test-video.mp4",
          mimeType: "video/mp4",
        },
      });

      expect(video.id).toBeDefined();
      expect(video.title).toBe("Test Video");
      expect(video.blobUrl).toBe(
        "https://blob.vercel-storage.com/test-video.mp4"
      );
      expect(video.mimeType).toBe("video/mp4");
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a video with optional fields", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          description: "A test video description",
          blobUrl: "https://blob.vercel-storage.com/test-video.mp4",
          thumbnailUrl: "https://blob.vercel-storage.com/thumbnail.jpg",
          duration: 120,
          fileSize: 1024000,
          mimeType: "video/mp4",
        },
      });

      expect(video.description).toBe("A test video description");
      expect(video.thumbnailUrl).toBe(
        "https://blob.vercel-storage.com/thumbnail.jpg"
      );
      expect(video.duration).toBe(120);
      expect(video.fileSize).toBe(1024000);
    });

    it("should update video timestamps on modification", async () => {
      const video = await prisma.video.create({
        data: {
          title: "Test Video",
          blobUrl: "https://blob.vercel-storage.com/test-video.mp4",
          mimeType: "video/mp4",
        },
      });

      const originalUpdatedAt = video.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await prisma.video.update({
        where: { id: video.id },
        data: { title: "Updated Title" },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Display Model", () => {
    it("should create a display with required fields", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Display 1",
          token: "unique-token-123",
        },
      });

      expect(display.id).toBeDefined();
      expect(display.name).toBe("Display 1");
      expect(display.token).toBe("unique-token-123");
      expect(display.isActive).toBe(true); // Default value
      expect(display.createdAt).toBeInstanceOf(Date);
    });

    it("should enforce unique token constraint", async () => {
      await prisma.display.create({
        data: {
          name: "Display 1",
          token: "duplicate-token",
        },
      });

      await expect(
        prisma.display.create({
          data: {
            name: "Display 2",
            token: "duplicate-token",
          },
        })
      ).rejects.toThrow();
    });

    it("should update lastSeenAt timestamp", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Display 1",
          token: "token-123",
        },
      });

      expect(display.lastSeenAt).toBeNull();

      const updated = await prisma.display.update({
        where: { id: display.id },
        data: { lastSeenAt: new Date() },
      });

      expect(updated.lastSeenAt).toBeInstanceOf(Date);
    });
  });

  describe("Playlist Model", () => {
    it("should create a playlist for a display", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Display 1",
          token: "token-123",
        },
      });

      const playlist = await prisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: PlaybackMode.LOOP,
        },
      });

      expect(playlist.id).toBeDefined();
      expect(playlist.displayId).toBe(display.id);
      expect(playlist.playbackMode).toBe(PlaybackMode.LOOP);
      expect(playlist.isActive).toBe(true);
    });

    it("should enforce one playlist per display", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Display 1",
          token: "token-123",
        },
      });

      await prisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: PlaybackMode.SEQUENCE,
        },
      });

      await expect(
        prisma.playlist.create({
          data: {
            displayId: display.id,
            playbackMode: PlaybackMode.MANUAL,
          },
        })
      ).rejects.toThrow();
    });

    it("should cascade delete playlist when display is deleted", async () => {
      const display = await prisma.display.create({
        data: {
          name: "Display 1",
          token: "token-123",
        },
      });

      const playlist = await prisma.playlist.create({
        data: {
          displayId: display.id,
        },
      });

      await prisma.display.delete({
        where: { id: display.id },
      });

      const deletedPlaylist = await prisma.playlist.findUnique({
        where: { id: playlist.id },
      });

      expect(deletedPlaylist).toBeNull();
    });
  });

  describe("PlaylistItem Model", () => {
    it("should create playlist items with ordering", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video1 = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      const video2 = await prisma.video.create({
        data: {
          title: "Video 2",
          blobUrl: "https://example.com/video2.mp4",
          mimeType: "video/mp4",
        },
      });

      const item1 = await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video1.id,
          position: 0,
        },
      });

      const item2 = await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video2.id,
          position: 1,
        },
      });

      expect(item1.position).toBe(0);
      expect(item2.position).toBe(1);
    });

    it("should enforce unique video per playlist", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video.id,
          position: 0,
        },
      });

      await expect(
        prisma.playlistItem.create({
          data: {
            playlistId: playlist.id,
            videoId: video.id,
            position: 1,
          },
        })
      ).rejects.toThrow();
    });

    it("should enforce unique position per playlist", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video1 = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      const video2 = await prisma.video.create({
        data: {
          title: "Video 2",
          blobUrl: "https://example.com/video2.mp4",
          mimeType: "video/mp4",
        },
      });

      await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video1.id,
          position: 0,
        },
      });

      await expect(
        prisma.playlistItem.create({
          data: {
            playlistId: playlist.id,
            videoId: video2.id,
            position: 0,
          },
        })
      ).rejects.toThrow();
    });

    it("should cascade delete items when playlist is deleted", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
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

      await prisma.playlist.delete({
        where: { id: playlist.id },
      });

      const deletedItem = await prisma.playlistItem.findUnique({
        where: { id: item.id },
      });

      expect(deletedItem).toBeNull();
    });

    it("should cascade delete items when video is deleted", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
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

  describe("Relationships", () => {
    it("should load playlist with display relation", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: {
          displayId: display.id,
          playbackMode: PlaybackMode.LOOP,
        },
        include: { display: true },
      });

      expect(playlist.display.name).toBe("Display 1");
    });

    it("should load playlist with items and videos", async () => {
      const display = await prisma.display.create({
        data: { name: "Display 1", token: "token-123" },
      });

      const playlist = await prisma.playlist.create({
        data: { displayId: display.id },
      });

      const video = await prisma.video.create({
        data: {
          title: "Video 1",
          blobUrl: "https://example.com/video1.mp4",
          mimeType: "video/mp4",
        },
      });

      await prisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video.id,
          position: 0,
        },
      });

      const loadedPlaylist = await prisma.playlist.findUnique({
        where: { id: playlist.id },
        include: {
          items: {
            include: { video: true },
            orderBy: { position: "asc" },
          },
        },
      });

      expect(loadedPlaylist?.items).toHaveLength(1);
      expect(loadedPlaylist?.items[0].video.title).toBe("Video 1");
    });
  });
});
