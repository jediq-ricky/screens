import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteVideo } from "@/lib/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/videos/:id - Get a specific video
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        blobUrl: true,
        thumbnailUrl: true,
        duration: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

// PATCH /api/videos/:id - Update video metadata
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Check if video exists
    const existing = await prisma.video.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Validate title if provided
    if (body.title !== undefined && body.title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    // Don't allow changing blobUrl or fileSize
    const { blobUrl, fileSize, mimeType, ...allowedUpdates } = body;

    // Update video
    const video = await prisma.video.update({
      where: { id },
      data: {
        ...(allowedUpdates.title !== undefined && {
          title: allowedUpdates.title.trim(),
        }),
        ...(allowedUpdates.description !== undefined && {
          description: allowedUpdates.description?.trim() || null,
        }),
        ...(allowedUpdates.thumbnailUrl !== undefined && {
          thumbnailUrl: allowedUpdates.thumbnailUrl || null,
        }),
        ...(allowedUpdates.duration !== undefined && {
          duration: allowedUpdates.duration,
        }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        blobUrl: true,
        thumbnailUrl: true,
        duration: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

// DELETE /api/videos/:id - Delete a video
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check if video exists
    const existing = await prisma.video.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Delete from blob storage first
    try {
      await deleteVideo(existing.blobUrl);
    } catch (storageError) {
      console.error("Error deleting video from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (cascades to playlist items)
    await prisma.video.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
