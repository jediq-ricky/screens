import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PlaylistEditor from "@/components/controller/PlaylistEditor";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlaylistPage({ params }: PageProps) {
  const { id } = await params;

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          video: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      displays: {
        include: {
          display: true,
        },
      },
    },
  });

  if (!playlist) {
    notFound();
  }

  const videos = await prisma.video.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configure Playlist</h1>
        <p className="text-gray-600 mt-2">
          Manage playlist: {playlist.name}
        </p>
      </div>

      <PlaylistEditor playlist={playlist} availableVideos={videos} />
    </div>
  );
}
