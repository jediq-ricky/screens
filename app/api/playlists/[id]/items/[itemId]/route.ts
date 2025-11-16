import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sseManager } from "@/lib/sse";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { triggerType, triggerConfig } = body;

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

    // Validate trigger type
    const validTriggerTypes = ["NONE", "KEYBOARD", "CLICK", "WEBCAM", "MICROPHONE"];
    if (triggerType && !validTriggerTypes.includes(triggerType)) {
      return NextResponse.json(
        { error: "Invalid trigger type" },
        { status: 400 }
      );
    }

    // Validate trigger config based on type
    if (triggerType && triggerType !== "NONE" && triggerConfig) {
      const config = triggerConfig as Record<string, unknown>;

      switch (triggerType) {
        case "KEYBOARD":
          if (!config.key || typeof config.key !== "string") {
            return NextResponse.json(
              { error: "Keyboard trigger requires a 'key' string" },
              { status: 400 }
            );
          }
          break;
        case "CLICK":
          // Click can have optional region coordinates
          if (config.x !== undefined && typeof config.x !== "number") {
            return NextResponse.json(
              { error: "Click trigger 'x' must be a number" },
              { status: 400 }
            );
          }
          break;
        case "WEBCAM":
          // Webcam can have optional sensitivity
          if (config.sensitivity !== undefined &&
              (typeof config.sensitivity !== "number" ||
               config.sensitivity < 0 ||
               config.sensitivity > 100)) {
            return NextResponse.json(
              { error: "Webcam trigger 'sensitivity' must be a number between 0 and 100" },
              { status: 400 }
            );
          }
          break;
        case "MICROPHONE":
          // Microphone can have optional threshold
          if (config.threshold !== undefined &&
              (typeof config.threshold !== "number" ||
               config.threshold < 0 ||
               config.threshold > 100)) {
            return NextResponse.json(
              { error: "Microphone trigger 'threshold' must be a number between 0 and 100" },
              { status: 400 }
            );
          }
          break;
      }
    }

    // Update the playlist item
    const updatedItem = await prisma.playlistItem.update({
      where: { id: itemId },
      data: {
        triggerType: triggerType || undefined,
        triggerConfig: triggerConfig !== undefined ? triggerConfig : undefined,
      },
      include: {
        video: true,
      },
    });

    // Notify all displays using this playlist to reload
    const displays = await prisma.displayPlaylist.findMany({
      where: { playlistId: id },
      select: { displayId: true },
    });

    for (const { displayId } of displays) {
      sseManager.sendToDisplay(displayId, "playlist-updated", { playlistId: id });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating playlist item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
