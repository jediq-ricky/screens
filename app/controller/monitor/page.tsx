import { prisma } from "@/lib/db";
import MonitorDashboard from "@/components/controller/MonitorDashboard";

export default async function MonitorPage() {
  const displays = await prisma.display.findMany({
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitor Displays</h1>
      </div>
      <MonitorDashboard initialDisplays={displays} />
    </div>
  );
}
