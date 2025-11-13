import { prisma } from "../lib/db";

async function globalTeardown() {

  try {
    // Delete all displays that start with "E2E"
    const displays = await prisma.display.findMany({
      where: {
        name: {
          startsWith: "E2E",
        },
      },
    });

    console.log(`Cleaning up ${displays.length} E2E test displays...`);

    for (const display of displays) {
      // Delete display playlists
      await prisma.displayPlaylist.deleteMany({
        where: { displayId: display.id },
      });

      // Delete display
      await prisma.display.delete({
        where: { id: display.id },
      });
    }

    // Delete all playlists that start with "E2E"
    const playlists = await prisma.playlist.findMany({
      where: {
        name: {
          startsWith: "E2E",
        },
      },
    });

    console.log(`Cleaning up ${playlists.length} E2E test playlists...`);

    for (const playlist of playlists) {
      // Delete playlist items
      await prisma.playlistItem.deleteMany({
        where: { playlistId: playlist.id },
      });

      // Delete display playlists
      await prisma.displayPlaylist.deleteMany({
        where: { playlistId: playlist.id },
      });

      // Delete playlist
      await prisma.playlist.delete({
        where: { id: playlist.id },
      });
    }

    // Delete all videos that start with "E2E"
    const videos = await prisma.video.findMany({
      where: {
        title: {
          startsWith: "E2E",
        },
      },
    });

    console.log(`Cleaning up ${videos.length} E2E test videos...`);

    for (const video of videos) {
      // Delete playlist items that reference this video
      await prisma.playlistItem.deleteMany({
        where: { videoId: video.id },
      });

      // Delete video file from storage if it exists
      // Note: We don't actually delete from filesystem in tests
      // as the files are typically test fixtures

      // Delete video
      await prisma.video.delete({
        where: { id: video.id },
      });
    }

    console.log("E2E cleanup complete");
  } catch (error) {
    console.error("Error during E2E cleanup:", error);
  }
}

export default globalTeardown;
