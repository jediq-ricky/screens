import { prisma } from "@/lib/db";
import DisplayManager from "@/components/controller/DisplayManager";

export default async function DisplaysPage() {
  const displays = await prisma.display.findMany({
    orderBy: { createdAt: "desc" },
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
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Displays</h1>
      </div>
      <DisplayManager initialDisplays={displays} />
    </div>
  );
}
