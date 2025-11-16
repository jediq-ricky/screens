import { describe, it, expect, beforeEach } from "vitest";
import { setupIntegrationTest, testPrisma } from "@/tests/setup";

setupIntegrationTest();

describe("Trigger API Integration Tests", () => {
  let testPlaylist: any;
  let testVideo: any;
  let testItem: any;

  beforeEach(async () => {
    // Create test playlist with MANUAL playback mode
    testPlaylist = await testPrisma.playlist.create({
      data: {
        name: "Test Trigger Playlist",
        playbackMode: "MANUAL",
        videoGap: 0,
      },
    });

    // Create test video
    testVideo = await testPrisma.video.create({
      data: {
        title: "Test Video",
        blobUrl: "https://example.com/test.mp4",
        duration: 120,
        fileSize: 1024000,
        mimeType: "video/mp4",
      },
    });

    // Create playlist item
    testItem = await testPrisma.playlistItem.create({
      data: {
        playlistId: testPlaylist.id,
        videoId: testVideo.id,
        position: 0,
        triggerType: "NONE",
      },
    });
  });

  describe("PlaylistItem Trigger Updates", () => {
    it("should update playlist item with KEYBOARD trigger", async () => {
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "KEYBOARD",
          triggerConfig: { key: "1" },
        },
      });

      expect(updated.triggerType).toBe("KEYBOARD");
      expect(updated.triggerConfig).toEqual({ key: "1" });
    });

    it("should update playlist item with CLICK trigger", async () => {
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "CLICK",
          triggerConfig: { x: 100, y: 200 },
        },
      });

      expect(updated.triggerType).toBe("CLICK");
      expect(updated.triggerConfig).toEqual({ x: 100, y: 200 });
    });

    it("should update playlist item with WEBCAM trigger", async () => {
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "WEBCAM",
          triggerConfig: { sensitivity: 75 },
        },
      });

      expect(updated.triggerType).toBe("WEBCAM");
      expect(updated.triggerConfig).toEqual({ sensitivity: 75 });
    });

    it("should update playlist item with MICROPHONE trigger", async () => {
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "MICROPHONE",
          triggerConfig: { threshold: 60 },
        },
      });

      expect(updated.triggerType).toBe("MICROPHONE");
      expect(updated.triggerConfig).toEqual({ threshold: 60 });
    });

    it("should update trigger type to NONE with null config", async () => {
      // First set to KEYBOARD
      await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "KEYBOARD",
          triggerConfig: { key: "5" },
        },
      });

      // Then change back to NONE
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "NONE",
          triggerConfig: null,
        },
      });

      expect(updated.triggerType).toBe("NONE");
      expect(updated.triggerConfig).toBeNull();
    });

    it("should create playlist item with trigger configuration", async () => {
      // Create a new video for this item
      const newVideo = await testPrisma.video.create({
        data: {
          title: "Test Video 2",
          blobUrl: "https://example.com/test2.mp4",
          duration: 120,
          fileSize: 1024000,
          mimeType: "video/mp4",
        },
      });

      const newItem = await testPrisma.playlistItem.create({
        data: {
          playlistId: testPlaylist.id,
          videoId: newVideo.id,
          position: 1,
          triggerType: "KEYBOARD",
          triggerConfig: { key: "2" },
        },
      });

      expect(newItem.triggerType).toBe("KEYBOARD");
      expect(newItem.triggerConfig).toEqual({ key: "2" });
    });

    it("should retrieve playlist item with trigger configuration", async () => {
      await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "KEYBOARD",
          triggerConfig: { key: "3" },
        },
      });

      const retrieved = await testPrisma.playlistItem.findUnique({
        where: { id: testItem.id },
      });

      expect(retrieved?.triggerType).toBe("KEYBOARD");
      expect(retrieved?.triggerConfig).toEqual({ key: "3" });
    });

    it("should update trigger config while keeping trigger type", async () => {
      // Set initial keyboard trigger
      await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "KEYBOARD",
          triggerConfig: { key: "1" },
        },
      });

      // Update the config
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerConfig: { key: "5" },
        },
      });

      expect(updated.triggerType).toBe("KEYBOARD");
      expect(updated.triggerConfig).toEqual({ key: "5" });
    });

    it("should handle complex trigger configuration", async () => {
      const updated = await testPrisma.playlistItem.update({
        where: { id: testItem.id },
        data: {
          triggerType: "CLICK",
          triggerConfig: {
            x: 150,
            y: 250,
            radius: 50,
            description: "Center area",
          },
        },
      });

      expect(updated.triggerType).toBe("CLICK");
      expect(updated.triggerConfig).toEqual({
        x: 150,
        y: 250,
        radius: 50,
        description: "Center area",
      });
    });
  });

  describe("Trigger Queries", () => {
    beforeEach(async () => {
      // Create multiple playlist items with different triggers and unique videos
      const video2 = await testPrisma.video.create({
        data: {
          title: "Test Video Query 1",
          blobUrl: "https://example.com/query1.mp4",
          duration: 120,
          fileSize: 1024000,
          mimeType: "video/mp4",
        },
      });

      const video3 = await testPrisma.video.create({
        data: {
          title: "Test Video Query 2",
          blobUrl: "https://example.com/query2.mp4",
          duration: 120,
          fileSize: 1024000,
          mimeType: "video/mp4",
        },
      });

      await testPrisma.playlistItem.create({
        data: {
          playlistId: testPlaylist.id,
          videoId: video2.id,
          position: 1,
          triggerType: "KEYBOARD",
          triggerConfig: { key: "1" },
        },
      });

      await testPrisma.playlistItem.create({
        data: {
          playlistId: testPlaylist.id,
          videoId: video3.id,
          position: 2,
          triggerType: "CLICK",
          triggerConfig: { x: 100, y: 100 },
        },
      });
    });

    it("should filter playlist items by trigger type", async () => {
      const keyboardItems = await testPrisma.playlistItem.findMany({
        where: {
          playlistId: testPlaylist.id,
          triggerType: "KEYBOARD",
        },
      });

      expect(keyboardItems.length).toBe(1);
      expect(keyboardItems[0].triggerType).toBe("KEYBOARD");
    });

    it("should retrieve all playlist items with their triggers", async () => {
      const items = await testPrisma.playlistItem.findMany({
        where: { playlistId: testPlaylist.id },
        orderBy: { position: "asc" },
      });

      expect(items.length).toBe(3); // initial + 2 new items
      expect(items.some(item => item.triggerType === "KEYBOARD")).toBe(true);
      expect(items.some(item => item.triggerType === "CLICK")).toBe(true);
      expect(items.some(item => item.triggerType === "NONE")).toBe(true);
    });

    it("should include trigger config in playlist query", async () => {
      const playlist = await testPrisma.playlist.findUnique({
        where: { id: testPlaylist.id },
        include: {
          items: {
            orderBy: { position: "asc" },
          },
        },
      });

      expect(playlist?.items.length).toBeGreaterThan(0);
      const keyboardItem = playlist?.items.find(
        item => item.triggerType === "KEYBOARD"
      );
      expect(keyboardItem?.triggerConfig).toEqual({ key: "1" });
    });
  });

  describe("Trigger Type Validation", () => {
    it("should accept all valid trigger types", async () => {
      const triggerTypes = ["NONE", "KEYBOARD", "CLICK", "WEBCAM", "MICROPHONE"];

      for (const triggerType of triggerTypes) {
        // Create unique video for each trigger type
        const video = await testPrisma.video.create({
          data: {
            title: `Test Video ${triggerType}`,
            blobUrl: `https://example.com/${triggerType.toLowerCase()}.mp4`,
            duration: 120,
            fileSize: 1024000,
            mimeType: "video/mp4",
          },
        });

        const item = await testPrisma.playlistItem.create({
          data: {
            playlistId: testPlaylist.id,
            videoId: video.id,
            position: triggerTypes.indexOf(triggerType) + 10,
            triggerType: triggerType as any,
          },
        });

        expect(item.triggerType).toBe(triggerType);
      }
    });

    it("should default to NONE when trigger type is not specified", async () => {
      const video = await testPrisma.video.create({
        data: {
          title: "Test Video Default",
          blobUrl: "https://example.com/default.mp4",
          duration: 120,
          fileSize: 1024000,
          mimeType: "video/mp4",
        },
      });

      const item = await testPrisma.playlistItem.create({
        data: {
          playlistId: testPlaylist.id,
          videoId: video.id,
          position: 99,
        },
      });

      expect(item.triggerType).toBe("NONE");
      expect(item.triggerConfig).toBeNull();
    });
  });
});
