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
    const { command, index } = await request.json();

    // Verify display exists
    const display = await prisma.display.findUnique({
      where: { id },
    });

    if (!display) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    // Validate command
    const validCommands = ["play", "pause", "next", "previous", "skip"];
    if (!validCommands.includes(command)) {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    // For skip command, index is required
    if (command === "skip" && typeof index !== "number") {
      return NextResponse.json(
        { error: "Index required for skip command" },
        { status: 400 }
      );
    }

    // Send control command to display via SSE
    sseManager.sendToDisplay(id, "control", { command, index });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending control command:", error);
    return NextResponse.json(
      { error: "Failed to send command" },
      { status: 500 }
    );
  }
}
