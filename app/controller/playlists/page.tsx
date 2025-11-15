import { prisma } from "@/lib/db";
import Link from "next/link";
import PlaylistCreate from "@/components/controller/PlaylistCreate";

export default async function PlaylistsPage() {
  const playlists = await prisma.playlist.findMany({
    include: {
      displays: {
        include: {
          display: true,
        },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
        <PlaylistCreate />
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No playlists found</p>
          <p className="text-gray-400 mt-2">
            Create a playlist by configuring a display
          </p>
          <Link
            href="/controller/displays"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Displays
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {playlist.name}
                </h3>
                {playlist.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {playlist.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Playback Mode:</span>{" "}
                    {playlist.playbackMode.toLowerCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Videos:</span>{" "}
                    {playlist._count.items}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Assigned to:</span>{" "}
                    {playlist.displays.length === 0
                      ? "No displays"
                      : playlist.displays.length === 1
                      ? playlist.displays[0].display.name
                      : `${playlist.displays.length} displays`}
                  </div>
                  <div className="text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        playlist.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {playlist.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/controller/playlists/${playlist.id}`}
                  className="mt-4 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit Playlist
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
