import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sseManager } from "@/lib/sse";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;

    // Check if playlist item exists and belongs to the playlist
    const playlistItem = await prisma.playlistItem.findUnique({
      where: { id: itemId },
    });

    if (!playlistItem || playlistItem.playlistId !== id) {
      return NextResponse.json(
        { error: "Playlist item not found" },
        { status: 404 }
      );
    }

    await prisma.playlistItem.delete({
      where: { id: itemId },
    });

    // Notify all displays using this playlist to reload
    const displays = await prisma.displayPlaylist.findMany({
      where: { playlistId: id },
      select: { displayId: true },
    });

    for (const { displayId } of displays) {
      sseManager.sendToDisplay(displayId, "playlist-updated", { playlistId: id });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting playlist item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
