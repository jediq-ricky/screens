import Link from "next/link";

export default function ControllerDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/controller/videos"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Video Library
          </h2>
          <p className="text-gray-600">
            Upload and manage your video collection
          </p>
        </Link>

        <Link
          href="/controller/displays"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Displays
          </h2>
          <p className="text-gray-600">
            Register and manage display devices
          </p>
        </Link>

        <Link
          href="/controller/playlists"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Playlists
          </h2>
          <p className="text-gray-600">
            Configure playlists for each display
          </p>
        </Link>
      </div>
    </div>
  );
}
