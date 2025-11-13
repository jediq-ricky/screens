import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { playbackMode, isActive, name, description } = body;

    // Validate playback mode if provided
    if (playbackMode) {
      const validModes = ["LOOP", "SEQUENCE", "MANUAL"];
      if (!validModes.includes(playbackMode)) {
        return NextResponse.json(
          { error: "Invalid playback mode" },
          { status: 400 }
        );
      }
    }

    // Check if playlist exists
    const existing = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const updateData: {
      playbackMode?: string;
      isActive?: boolean;
      name?: string;
      description?: string | null;
    } = {};

    if (playbackMode) updateData.playbackMode = playbackMode;
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const playlist = await prisma.playlist.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(playlist, { status: 200 });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if playlist exists
    const existing = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Delete playlist (cascade deletes items)
    await prisma.playlist.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
