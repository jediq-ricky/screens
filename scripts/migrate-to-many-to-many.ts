#!/usr/bin/env tsx
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration to many-to-many playlists...");

  try {
    // Step 1: Get all existing playlists with their display relationship
    const existingPlaylists = await prisma.playlist.findMany({
      where: {
        displayId: {
          not: null,
        },
      },
      include: {
        display: true,
      },
    });

    console.log(`Found ${existingPlaylists.length} existing playlists to migrate`);

    // Step 2: For each playlist, create a DisplayPlaylist record and set name
    for (const playlist of existingPlaylists) {
      if (!playlist.display || !playlist.displayId) continue;

      const playlistName = `${playlist.display.name} Playlist`;

      console.log(
        `Migrating playlist ${playlist.id} for display "${playlist.display.name}"`
      );

      // Update playlist name if it's empty
      if (!playlist.name || playlist.name === "") {
        await prisma.playlist.update({
          where: { id: playlist.id },
          data: { name: playlistName },
        });
      }

      // Create DisplayPlaylist junction record (will skip if already exists)
      try {
        await prisma.displayPlaylist.create({
          data: {
            displayId: playlist.displayId,
            playlistId: playlist.id,
          },
        });
        console.log(`  ✓ Created DisplayPlaylist junction for ${playlist.id}`);
      } catch (error: any) {
        if (error.code === "P2002") {
          console.log(`  - Junction already exists for ${playlist.id}`);
        } else {
          throw error;
        }
      }
    }

    console.log("\nMigration completed successfully!");
    console.log("Note: Legacy displayId field is still present for compatibility.");
    console.log("Run schema migration to remove it after verifying everything works.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
