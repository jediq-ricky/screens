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

  it("should fetch playlists with display data", async () => {
    // Create a display with a playlist
    const display1 = await testPrisma.display.create({
      data: {
        name: "Display 1",
        token: "token12345678901234567890123456",
      },
    });

    const playlist1 = await testPrisma.playlist.create({
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
        playlistId: playlist1.id,
        videoId: video1.id,
        position: 0,
      },
    });

    await testPrisma.playlistItem.create({
      data: {
        playlistId: playlist1.id,
        videoId: video2.id,
        position: 1,
      },
    });

    // Create another display with a playlist
    const display2 = await testPrisma.display.create({
      data: {
        name: "Display 2",
        token: "token22345678901234567890123456",
      },
    });

    const playlist2 = await testPrisma.playlist.create({
      data: {
        displayId: display2.id,
        playbackMode: "SEQUENCE",
        isActive: false,
      },
    });

    // Fetch playlists with display data
    const playlists = await testPrisma.playlist.findMany({
      include: {
        display: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(playlists).toHaveLength(2);

    // Check playlist with items
    const playlistWithItems = playlists.find((p) => p.id === playlist1.id);
    expect(playlistWithItems).toBeDefined();
    expect(playlistWithItems?.playbackMode).toBe("LOOP");
    expect(playlistWithItems?.isActive).toBe(true);
    expect(playlistWithItems?._count.items).toBe(2);
    expect(playlistWithItems?.display.name).toBe("Display 1");

    // Check playlist without items
    const playlistWithoutItems = playlists.find((p) => p.id === playlist2.id);
    expect(playlistWithoutItems).toBeDefined();
    expect(playlistWithoutItems?.playbackMode).toBe("SEQUENCE");
    expect(playlistWithoutItems?.isActive).toBe(false);
    expect(playlistWithoutItems?._count.items).toBe(0);
    expect(playlistWithoutItems?.display.name).toBe("Display 2");
  });

  it("should return empty array when no playlists exist", async () => {
    const playlists = await testPrisma.playlist.findMany({
      include: {
        display: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(playlists).toHaveLength(0);
  });

  it("should order playlists by createdAt descending", async () => {
    const display1 = await testPrisma.display.create({
      data: {
        name: "First Display",
        token: "token12345678901234567890123456",
      },
    });

    const playlist1 = await testPrisma.playlist.create({
      data: {
        displayId: display1.id,
        playbackMode: "LOOP",
        createdAt: new Date("2024-01-01"),
      },
    });

    const display2 = await testPrisma.display.create({
      data: {
        name: "Second Display",
        token: "token22345678901234567890123456",
      },
    });

    const playlist2 = await testPrisma.playlist.create({
      data: {
        displayId: display2.id,
        playbackMode: "SEQUENCE",
        createdAt: new Date("2024-01-02"),
      },
    });

    const playlists = await testPrisma.playlist.findMany({
      include: {
        display: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    expect(playlists[0].id).toBe(playlist2.id);
    expect(playlists[1].id).toBe(playlist1.id);
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

    const playlists = await testPrisma.playlist.findMany({
      include: {
        display: true,
        _count: {
          select: { items: true },
        },
      },
    });

    expect(playlists[0]._count.items).toBe(3);
  });
});
