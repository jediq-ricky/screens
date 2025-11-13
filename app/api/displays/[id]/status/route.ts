import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sseManager } from "@/lib/sse";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { currentVideoIndex, currentVideoId, isPlaying, timestamp } =
      await request.json();

    // Verify display exists
    const display = await prisma.display.findUnique({
      where: { id },
    });

    if (!display) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    // Update last seen timestamp
    await prisma.display.update({
      where: { id },
      data: { lastSeenAt: new Date() },
    });

    // Broadcast status to all controllers
    sseManager.broadcast("display-status", {
      displayId: id,
      currentVideoIndex,
      currentVideoId,
      isPlaying,
      timestamp,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating display status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
