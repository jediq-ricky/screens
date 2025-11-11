import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { videoId } = body;

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "videoId is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: 404 }
      );
    }

    // Check if video already in playlist
    const existingItem = await prisma.playlistItem.findUnique({
      where: {
        playlistId_videoId: {
          playlistId: id,
          videoId,
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Video already in playlist" },
        { status: 409 }
      );
    }

    // Get next position
    const maxPosition = playlist.items.length > 0
      ? Math.max(...playlist.items.map((item) => item.position))
      : -1;

    const playlistItem = await prisma.playlistItem.create({
      data: {
        playlistId: id,
        videoId,
        position: maxPosition + 1,
      },
    });

    return NextResponse.json(playlistItem, { status: 201 });
  } catch (error) {
    console.error("Error adding video to playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
