import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import DisplayClient from "@/components/display/DisplayClient";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function DisplayPage({ params }: PageProps) {
  const { token } = await params;

  // Find display by token
  const display = await prisma.display.findUnique({
    where: { token },
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
    notFound();
  }

  // Update last seen timestamp
  await prisma.display.update({
    where: { id: display.id },
    data: { lastSeenAt: new Date() },
  });

  // Get the playlist (first one if multiple assigned)
  const playlist = display.playlists.length > 0 ? display.playlists[0].playlist : null;

  return <DisplayClient display={{ ...display, playlist }} />;
}
