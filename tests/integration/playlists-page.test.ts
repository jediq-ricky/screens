import { describe, it, expect, beforeEach } from "vitest";
import { setupIntegrationTest, testPrisma } from "@/tests/setup";

setupIntegrationTest();

describe("Playlists Page Data", () => {
  beforeEach(async () => {
    await testPrisma.playlistItem.deleteMany();
    await testPrisma.playlist.deleteMany();
    await testPrisma.display.deleteMany();
    await testPrisma.video.deleteMany();
  });

  it("should fetch displays with playlist data", async () => {
    // Create a display with a playlist
    const display1 = await testPrisma.display.create({
      data: {
        name: "Display 1",
        token: "token12345678901234567890123456",
      },
    });

    const playlist = await testPrisma.playlist.create({
      data: {
        displayId: display1.id,
        playbackMode: "LOOP",
        isActive: true,
      },
    });

    // Create some videos and add to playlist
    const video1 = await testPrisma.video.create({
      data: {
        title: "Video 1",
        blobUrl: "https://example.com/video1.mp4",
        fileSize: 1024,
        mimeType: "video/mp4",
      },
    });

    const video2 = await testPrisma.video.create({
      data: {
        title: "Video 2",
        blobUrl: "https://example.com/video2.mp4",
        fileSize: 2048,
        mimeType: "video/mp4",
      },
    });

    await testPrisma.playlistItem.create({
      data: {
        playlistId: playlist.id,
        videoId: video1.id,
        position: 0,
      },
    });

    await testPrisma.playlistItem.create({
      data: {
        playlistId: playlist.id,
        videoId: video2.id,
        position: 1,
      },
    });

    // Create a display without a playlist
    const display2 = await testPrisma.display.create({
      data: {
        name: "Display 2",
        token: "token22345678901234567890123456",
      },
    });

    // Fetch displays with playlist data
    const displays = await testPrisma.display.findMany({
      include: {
        playlist: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(displays).toHaveLength(2);

    // Check display with playlist
    const displayWithPlaylist = displays.find((d) => d.id === display1.id);
    expect(displayWithPlaylist).toBeDefined();
    expect(displayWithPlaylist?.playlist).toBeDefined();
    expect(displayWithPlaylist?.playlist?.playbackMode).toBe("LOOP");
    expect(displayWithPlaylist?.playlist?.isActive).toBe(true);
    expect(displayWithPlaylist?.playlist?._count.items).toBe(2);

    // Check display without playlist
    const displayWithoutPlaylist = displays.find((d) => d.id === display2.id);
    expect(displayWithoutPlaylist).toBeDefined();
    expect(displayWithoutPlaylist?.playlist).toBeNull();
  });

  it("should return empty array when no displays exist", async () => {
    const displays = await testPrisma.display.findMany({
      include: {
        playlist: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(displays).toHaveLength(0);
  });

  it("should order displays by createdAt descending", async () => {
    const display1 = await testPrisma.display.create({
      data: {
        name: "First Display",
        token: "token12345678901234567890123456",
        createdAt: new Date("2024-01-01"),
      },
    });

    const display2 = await testPrisma.display.create({
      data: {
        name: "Second Display",
        token: "token22345678901234567890123456",
        createdAt: new Date("2024-01-02"),
      },
    });

    const displays = await testPrisma.display.findMany({
      include: {
        playlist: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(displays[0].id).toBe(display2.id);
    expect(displays[1].id).toBe(display1.id);
  });

  it("should correctly count playlist items", async () => {
    const display = await testPrisma.display.create({
      data: {
        name: "Display",
        token: "token12345678901234567890123456",
      },
    });

    const playlist = await testPrisma.playlist.create({
      data: {
        displayId: display.id,
        playbackMode: "SEQUENCE",
      },
    });

    // Add 3 videos to playlist
    for (let i = 0; i < 3; i++) {
      const video = await testPrisma.video.create({
        data: {
          title: `Video ${i}`,
          blobUrl: `https://example.com/video${i}.mp4`,
          fileSize: 1024,
          mimeType: "video/mp4",
        },
      });

      await testPrisma.playlistItem.create({
        data: {
          playlistId: playlist.id,
          videoId: video.id,
          position: i,
        },
      });
    }

    const displays = await testPrisma.display.findMany({
      include: {
        playlist: {
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
      },
    });

    expect(displays[0].playlist?._count.items).toBe(3);
  });
});
