import { describe, it, expect, beforeEach } from "vitest";
import { setupIntegrationTest, testPrisma } from "@/tests/setup";

setupIntegrationTest();

describe("Playlist videoGap Integration Tests", () => {
  let testDisplay: any;
  let testPlaylist: any;

  beforeEach(async () => {
    // Create a test display and playlist for each test
    testDisplay = await testPrisma.display.create({
      data: {
        name: "Test Display",
        token: "test-token-12345678901234567890",
      },
    });

    testPlaylist = await testPrisma.playlist.create({
      data: {
        displayId: testDisplay.id,
        playbackMode: "SEQUENCE",
        videoGap: 0,
      },
    });
  });

  describe("videoGap Database Operations", () => {
    it("should update playlist videoGap with valid value", async () => {
      const updated = await testPrisma.playlist.update({
        where: { id: testPlaylist.id },
        data: { videoGap: 5 },
      });

      expect(updated.videoGap).toBe(5);

      // Verify in database
      const playlist = await testPrisma.playlist.findUnique({
        where: { id: testPlaylist.id },
      });
      expect(playlist?.videoGap).toBe(5);
    });

    it("should accept videoGap of 0 (minimum valid value)", async () => {
      const updated = await testPrisma.playlist.update({
        where: { id: testPlaylist.id },
        data: { videoGap: 0 },
      });

      expect(updated.videoGap).toBe(0);
    });

    it("should accept videoGap of 60 (maximum valid value)", async () => {
      const updated = await testPrisma.playlist.update({
        where: { id: testPlaylist.id },
        data: { videoGap: 60 },
      });

      expect(updated.videoGap).toBe(60);
    });

    it("should update videoGap alongside other fields", async () => {
      const updated = await testPrisma.playlist.update({
        where: { id: testPlaylist.id },
        data: {
          playbackMode: "LOOP",
          videoGap: 15,
          name: "Updated Playlist",
        },
      });

      expect(updated.playbackMode).toBe("LOOP");
      expect(updated.videoGap).toBe(15);
      expect(updated.name).toBe("Updated Playlist");
    });

    it("should create playlist with custom videoGap", async () => {
      // Create a new display for this test since displayId must be unique
      const newDisplay = await testPrisma.display.create({
        data: {
          name: "Test Display 2",
          token: "test-token-22345678901234567890",
        },
      });

      const playlist = await testPrisma.playlist.create({
        data: {
          displayId: newDisplay.id,
          playbackMode: "LOOP",
          videoGap: 30,
        },
      });

      expect(playlist.videoGap).toBe(30);
    });

    it("should retrieve playlist with videoGap value", async () => {
      await testPrisma.playlist.update({
        where: { id: testPlaylist.id },
        data: { videoGap: 10 },
      });

      const playlist = await testPrisma.playlist.findUnique({
        where: { id: testPlaylist.id },
      });

      expect(playlist).toBeDefined();
      expect(playlist?.videoGap).toBe(10);
    });

    it("should default videoGap to 0 for new playlists", async () => {
      // Create a new display for this test since displayId must be unique
      const newDisplay = await testPrisma.display.create({
        data: {
          name: "Test Display 3",
          token: "test-token-32345678901234567890",
        },
      });

      const playlist = await testPrisma.playlist.create({
        data: {
          displayId: newDisplay.id,
          playbackMode: "SEQUENCE",
        },
      });

      expect(playlist.videoGap).toBe(0);
    });
  });
});
