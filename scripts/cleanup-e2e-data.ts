import { prisma } from "../lib/db";

async function cleanupE2EData() {
  console.log("Starting E2E test data cleanup...");

  // Delete all displays that start with "E2E" or test-related names
  const deletedDisplays = await prisma.display.deleteMany({
    where: {
      OR: [
        { name: { startsWith: "E2E" } },
        { name: { startsWith: "Test Display" } },
        { name: { startsWith: "Display With Playlist" } },
      ],
    },
  });

  console.log(`Deleted ${deletedDisplays.count} test displays`);

  // Delete all videos that start with "E2E" or test-related names
  const deletedVideos = await prisma.video.deleteMany({
    where: {
      OR: [
        { title: { startsWith: "E2E" } },
        { title: { startsWith: "Test Video" } },
      ],
    },
  });

  console.log(`Deleted ${deletedVideos.count} test videos`);

  console.log("Cleanup complete!");
}

cleanupE2EData()
  .catch((error) => {
    console.error("Error during cleanup:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
