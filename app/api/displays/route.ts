import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDisplayToken } from "@/lib/auth";

// GET /api/displays - List all displays
export async function GET() {
  try {
    const displays = await prisma.display.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        showControls: true,
        lastSeenAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't expose token in list view
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ displays });
  } catch (error) {
    console.error("Error fetching displays:", error);
    return NextResponse.json(
      { error: "Failed to fetch displays" },
      { status: 500 }
    );
  }
}

// POST /api/displays - Create a new display
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = generateDisplayToken();

    // Create display
    const display = await prisma.display.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        showControls: typeof body.showControls === "boolean" ? body.showControls : true,
        token,
      },
    });

    return NextResponse.json(display, { status: 201 });
  } catch (error) {
    console.error("Error creating display:", error);
    return NextResponse.json(
      { error: "Failed to create display" },
      { status: 500 }
    );
  }
}
