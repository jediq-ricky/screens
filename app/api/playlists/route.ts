import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayId, playbackMode } = body;

    if (!displayId || typeof displayId !== "string") {
      return NextResponse.json(
        { error: "displayId is required and must be a string" },
        { status: 400 }
      );
    }

    // Check if display exists
    const display = await prisma.display.findUnique({
      where: { id: displayId },
      include: { playlist: true },
    });

    if (!display) {
      return NextResponse.json(
        { error: "Display not found" },
        { status: 404 }
      );
    }

    // Check if display already has a playlist
    if (display.playlist) {
      return NextResponse.json(
        { error: "Display already has a playlist" },
        { status: 409 }
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

    const playlist = await prisma.playlist.create({
      data: {
        displayId,
        playbackMode: playbackMode || "SEQUENCE",
      },
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
