import { prisma } from "@/lib/db";
import DisplayManager from "@/components/controller/DisplayManager";

export default async function DisplaysPage() {
  const [displays, allPlaylists] = await Promise.all([
    prisma.display.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        playlists: {
          include: {
            playlist: {
              include: {
                items: {
                  include: {
                    video: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.playlist.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Displays</h1>
      </div>
      <DisplayManager initialDisplays={displays} availablePlaylists={allPlaylists} />
    </div>
  );
}
