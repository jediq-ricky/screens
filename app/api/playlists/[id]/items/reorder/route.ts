import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sseManager } from "@/lib/sse";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Update positions in a transaction
    await prisma.$transaction(
      items.map((item: { id: string; position: number }) =>
        prisma.playlistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    const updatedItems = await prisma.playlistItem.findMany({
      where: { playlistId: id },
      orderBy: { position: "asc" },
    });

    // Notify all displays using this playlist to reload
    const displays = await prisma.displayPlaylist.findMany({
      where: { playlistId: id },
      select: { displayId: true },
    });

    for (const { displayId } of displays) {
      sseManager.sendToDisplay(displayId, "playlist-updated", { playlistId: id });
    }

    return NextResponse.json(updatedItems, { status: 200 });
  } catch (error) {
    console.error("Error reordering playlist items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
