import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { playlistId } = await request.json();

    // Verify display exists
    const display = await prisma.display.findUnique({
      where: { id },
    });

    if (!display) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    // Verify playlist exists
    if (playlistId) {
      const playlist = await prisma.playlist.findUnique({
        where: { id: playlistId },
      });

      if (!playlist) {
        return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      }
    }

    // Remove existing playlist assignment
    await prisma.displayPlaylist.deleteMany({
      where: { displayId: id },
    });

    // Add new playlist assignment if playlistId provided
    if (playlistId) {
      await prisma.displayPlaylist.create({
        data: {
          displayId: id,
          playlistId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating display playlist:", error);
    return NextResponse.json(
      { error: "Failed to update playlist" },
      { status: 500 }
    );
  }
}
