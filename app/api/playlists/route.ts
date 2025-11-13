import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayId, playbackMode, name, description } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Validate playback mode if provided
    const validModes = ["LOOP", "SEQUENCE", "MANUAL"];
    if (playbackMode && !validModes.includes(playbackMode)) {
      return NextResponse.json(
        { error: "Invalid playback mode" },
        { status: 400 }
      );
    }

    // If displayId is provided, validate and check for existing assignment
    if (displayId) {
      const display = await prisma.display.findUnique({
        where: { id: displayId },
        include: {
          playlists: true,
        },
      });

      if (!display) {
        return NextResponse.json(
          { error: "Display not found" },
          { status: 404 }
        );
      }

      // Check if display already has a playlist assigned
      if (display.playlists.length > 0) {
        return NextResponse.json(
          { error: "Display already has a playlist assigned" },
          { status: 409 }
        );
      }
    }

    // Create the playlist
    const playlist = await prisma.playlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        playbackMode: playbackMode || "SEQUENCE",
      },
    });

    // If displayId provided, create the DisplayPlaylist relationship
    if (displayId) {
      await prisma.displayPlaylist.create({
        data: {
          displayId,
          playlistId: playlist.id,
        },
      });
    }

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
