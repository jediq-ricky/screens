import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const display = await prisma.display.findUnique({
      where: { id },
      include: {
        playlists: {
          include: {
            playlist: {
              include: {
                items: {
                  include: {
                    video: true,
                  },
                  orderBy: {
                    position: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!display) {
      return NextResponse.json({ error: "Display not found" }, { status: 404 });
    }

    const playlist = display.playlists.length > 0 ? display.playlists[0].playlist : null;

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("Error fetching display playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}
