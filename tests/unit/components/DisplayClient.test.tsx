import { describe, it, expect } from "vitest";
import { render, screen } from "@/lib/test-utils";
import DisplayClient from "@/components/display/DisplayClient";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlist: (Playlist & {
    items: (PlaylistItem & {
      video: Video;
    })[];
  }) | null;
};

describe("DisplayClient", () => {
  const mockVideos: Video[] = [
    {
      id: "video-1",
      title: "Video 1",
      description: "Description 1",
      blobUrl: "https://example.com/video1.mp4",
      thumbnailUrl: null,
      duration: 120,
      fileSize: 1024000,
      mimeType: "video/mp4",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "video-2",
      title: "Video 2",
      description: "Description 2",
      blobUrl: "https://example.com/video2.mp4",
      thumbnailUrl: null,
      duration: 180,
      fileSize: 2048000,
      mimeType: "video/mp4",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockDisplay: DisplayWithPlaylist = {
    id: "display-1",
    name: "Test Display",
    token: "abcdefghijklmnopqrstuvwxyz123456",
    description: "Test Description",
    isActive: true,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    playlist: {
      id: "playlist-1",
      displayId: "display-1",
      playbackMode: "SEQUENCE",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item-1",
          playlistId: "playlist-1",
          videoId: "video-1",
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          video: mockVideos[0],
        },
        {
          id: "item-2",
          playlistId: "playlist-1",
          videoId: "video-2",
          position: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          video: mockVideos[1],
        },
      ],
    },
  };

  it("should render display name", () => {
    render(<DisplayClient display={mockDisplay} />);
    expect(screen.getByText("Test Display")).toBeInTheDocument();
  });

  it("should show message when no playlist is configured", () => {
    const displayWithoutPlaylist: DisplayWithPlaylist = {
      ...mockDisplay,
      playlist: null,
    };

    render(<DisplayClient display={displayWithoutPlaylist} />);
    expect(screen.getByText(/no playlist configured/i)).toBeInTheDocument();
  });

  it("should show message when playlist has no videos", () => {
    const displayWithEmptyPlaylist: DisplayWithPlaylist = {
      ...mockDisplay,
      playlist: {
        ...mockDisplay.playlist!,
        items: [],
      },
    };

    render(<DisplayClient display={displayWithEmptyPlaylist} />);
    expect(screen.getByText(/no videos in playlist/i)).toBeInTheDocument();
  });

  it("should display playback mode", () => {
    render(<DisplayClient display={mockDisplay} />);
    expect(screen.getByText(/sequence/i)).toBeInTheDocument();
  });

  it("should show connection status indicator", () => {
    render(<DisplayClient display={mockDisplay} />);
    expect(screen.getByTestId("connection-status")).toBeInTheDocument();
  });

  it("should indicate active display status", () => {
    render(<DisplayClient display={mockDisplay} />);
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("should indicate inactive display status", () => {
    const inactiveDisplay: DisplayWithPlaylist = {
      ...mockDisplay,
      isActive: false,
    };

    render(<DisplayClient display={inactiveDisplay} />);
    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it("should display video player when playlist has videos", () => {
    render(<DisplayClient display={mockDisplay} />);
    const video = screen.getByTestId("video-player");
    expect(video).toBeInTheDocument();
  });

  it("should show playlist item count", () => {
    render(<DisplayClient display={mockDisplay} />);
    expect(screen.getByText(/2 videos/i)).toBeInTheDocument();
  });
});
