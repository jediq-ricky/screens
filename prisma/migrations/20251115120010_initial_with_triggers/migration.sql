-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('NONE', 'KEYBOARD', 'CLICK', 'WEBCAM', 'MICROPHONE');

-- AlterTable
ALTER TABLE "Display" ADD COLUMN     "showControls" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "videoGap" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "displayId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PlaylistItem" ADD COLUMN     "triggerConfig" JSONB,
ADD COLUMN     "triggerType" "TriggerType" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "DisplayPlaylist" (
    "id" TEXT NOT NULL,
    "displayId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisplayPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DisplayPlaylist_displayId_idx" ON "DisplayPlaylist"("displayId");

-- CreateIndex
CREATE INDEX "DisplayPlaylist_playlistId_idx" ON "DisplayPlaylist"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "DisplayPlaylist_displayId_playlistId_key" ON "DisplayPlaylist"("displayId", "playlistId");

-- CreateIndex
CREATE INDEX "Playlist_name_idx" ON "Playlist"("name");

-- AddForeignKey
ALTER TABLE "DisplayPlaylist" ADD CONSTRAINT "DisplayPlaylist_displayId_fkey" FOREIGN KEY ("displayId") REFERENCES "Display"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisplayPlaylist" ADD CONSTRAINT "DisplayPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
