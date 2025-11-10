import { prisma } from "@/lib/db";
import VideoLibrary from "@/components/controller/VideoLibrary";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Video Library</h1>
      </div>
      <VideoLibrary initialVideos={videos} />
    </div>
  );
}
