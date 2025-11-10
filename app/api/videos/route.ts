import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadVideo, deleteVideo } from "@/lib/storage";

// GET /api/videos - List all videos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const mimeType = searchParams.get("mimeType");

    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (mimeType) {
      where.mimeType = mimeType;
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST /api/videos - Upload a new video
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const duration = formData.get("duration") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "File must be a video" },
        { status: 400 }
      );
    }

    // Upload to blob storage
    const { url, size } = await uploadVideo(file, file.name);

    // Create database record
    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        blobUrl: url,
        fileSize: size,
        duration: duration ? parseInt(duration, 10) : null,
        mimeType: file.type,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}
