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

  const display = await prisma.display.findUnique({
    where: { id },
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
  });

  if (!display) {
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
          Manage the playlist for {display.name}
        </p>
      </div>

      <PlaylistEditor display={display} availableVideos={videos} />
    </div>
  );
}
