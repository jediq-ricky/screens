import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/displays/:id - Get a specific display
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const display = await prisma.display.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose token
      },
    });

    if (!display) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    return NextResponse.json(display);
  } catch (error) {
    console.error("Error fetching display:", error);
    return NextResponse.json(
      { error: "Failed to fetch display" },
      { status: 500 }
    );
  }
}

// PATCH /api/displays/:id - Update a display
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Prevent token modification
    const { token, ...allowedUpdates } = body;

    // Check if display exists
    const existing = await prisma.display.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    // Update display
    const display = await prisma.display.update({
      where: { id },
      data: {
        ...(allowedUpdates.name && { name: allowedUpdates.name.trim() }),
        ...(allowedUpdates.description !== undefined && {
          description: allowedUpdates.description?.trim() || null,
        }),
        ...(allowedUpdates.isActive !== undefined && {
          isActive: allowedUpdates.isActive,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(display);
  } catch (error) {
    console.error("Error updating display:", error);
    return NextResponse.json(
      { error: "Failed to update display" },
      { status: 500 }
    );
  }
}

// DELETE /api/displays/:id - Delete a display
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check if display exists
    const existing = await prisma.display.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    // Delete display (cascade deletes playlist)
    await prisma.display.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting display:", error);
    return NextResponse.json(
      { error: "Failed to delete display" },
      { status: 500 }
    );
  }
}
