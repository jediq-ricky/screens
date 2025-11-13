import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DisplayPlaylistPage({ params }: PageProps) {
  const { id } = await params;

  // Find the display and check if it has a playlist
  const display = await prisma.display.findUnique({
    where: { id },
    include: {
      playlists: {
        include: {
          playlist: true,
        },
      },
    },
  });

  if (!display) {
    notFound();
  }

  // If display already has a playlist, redirect to it
  if (display.playlists.length > 0) {
    redirect(`/controller/playlists/${display.playlists[0].playlist.id}`);
  }

  // Create a new playlist for this display
  const playlist = await prisma.playlist.create({
    data: {
      name: `${display.name} Playlist`,
      playbackMode: "SEQUENCE",
    },
  });

  // Link the playlist to the display
  await prisma.displayPlaylist.create({
    data: {
      displayId: display.id,
      playlistId: playlist.id,
    },
  });

  // Redirect to the newly created playlist
  redirect(`/controller/playlists/${playlist.id}`);
}
