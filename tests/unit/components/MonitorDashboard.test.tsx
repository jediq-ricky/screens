import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import MonitorDashboard from "@/components/controller/MonitorDashboard";
import type { Display, Playlist, PlaylistItem, Video, DisplayPlaylist } from "@/lib/generated/prisma";

// Mock the useSSE hook
vi.mock("@/lib/hooks/useSSE", () => ({
  useSSE: vi.fn(() => ({
    isConnected: true,
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
}));

type DisplayWithPlaylist = Display & {
  playlists: Array<DisplayPlaylist & {
    playlist: Playlist & {
      items: Array<PlaylistItem & { video: Video }>;
    };
  }>;
};

describe("MonitorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch for control commands
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );
  });

  const mockVideo: Video = {
    id: "video-1",
    title: "Test Video",
    description: "Test Description",
    blobUrl: "https://example.com/video.mp4",
    thumbnailUrl: null,
    duration: 120,
    fileSize: 1024000,
    mimeType: "video/mp4",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisplayWithPlaylist: DisplayWithPlaylist = {
    id: "display-1",
    name: "Test Display",
    token: "test-token-123456789012345678901234",
    description: "Test Description",
    isActive: true,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [{
      id: "dp-1",
      displayId: "display-1",
      playlistId: "playlist-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        name: "Test Playlist",
        description: null,
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [{
          id: "item-1",
          playlistId: "playlist-1",
          videoId: "video-1",
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          video: mockVideo,
        }],
      },
    }],
  };

  const mockDisplayWithoutPlaylist: DisplayWithPlaylist = {
    id: "display-2",
    name: "Display Without Playlist",
    token: "test-token-223456789012345678901234",
    description: null,
    isActive: true,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [],
  };

  it("should render SSE connection status", () => {
    render(<MonitorDashboard initialDisplays={[]} />);
    expect(screen.getByText(/SSE Connected/i)).toBeInTheDocument();
  });

  it("should show message when no displays exist", () => {
    render(<MonitorDashboard initialDisplays={[]} />);
    expect(screen.getByText(/No displays configured/i)).toBeInTheDocument();
  });

  it("should render display cards for each display", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist, mockDisplayWithoutPlaylist]} />);
    expect(screen.getByText("Test Display")).toBeInTheDocument();
    expect(screen.getByText("Display Without Playlist")).toBeInTheDocument();
  });

  it("should show connection status indicator", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);
    expect(screen.getByText(/SSE Connected/i)).toBeInTheDocument();
  });

  it("should display playlist info when display has playlist", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
    expect(screen.getByText(/1 video/i)).toBeInTheDocument();
  });

  it("should show no playlist message for displays without playlist", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithoutPlaylist]} />);
    expect(screen.getByText(/No playlist/i)).toBeInTheDocument();
  });

  it("should render control buttons for displays with playlists", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);

    expect(screen.getByTitle("Play")).toBeInTheDocument();
    expect(screen.getByTitle("Pause")).toBeInTheDocument();
    expect(screen.getByTitle("Previous")).toBeInTheDocument();
    expect(screen.getByTitle("Next")).toBeInTheDocument();
  });

  it("should not render control buttons for displays without playlists", () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithoutPlaylist]} />);

    const displayCard = screen.getByText("Display Without Playlist").closest("div")!.parentElement!;

    expect(displayCard.querySelector('button[title="Play"]')).not.toBeInTheDocument();
  });

  it("should send play command when play button clicked", async () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);

    const playButton = screen.getByTitle("Play");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/displays/display-1/control",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ command: "play" }),
        })
      );
    });
  });

  it("should send pause command when pause button clicked", async () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);

    const pauseButton = screen.getByTitle("Pause");
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/displays/display-1/control",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ command: "pause" }),
        })
      );
    });
  });

  it("should send next command when next button clicked", async () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);

    const nextButton = screen.getByTitle("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/displays/display-1/control",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ command: "next" }),
        })
      );
    });
  });

  it("should send previous command when previous button clicked", async () => {
    render(<MonitorDashboard initialDisplays={[mockDisplayWithPlaylist]} />);

    const prevButton = screen.getByTitle("Previous");
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/displays/display-1/control",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ command: "previous" }),
        })
      );
    });
  });

  it("should show last seen timestamp", () => {
    const recentDate = new Date(Date.now() - 5000); // 5 seconds ago
    const display = {
      ...mockDisplayWithPlaylist,
      lastSeenAt: recentDate,
    };

    render(<MonitorDashboard initialDisplays={[display]} />);
    expect(screen.getByText(/Last seen/i)).toBeInTheDocument();
  });

  it("should indicate offline status for displays not seen recently", () => {
    const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
    const display = {
      ...mockDisplayWithPlaylist,
      lastSeenAt: oldDate,
    };

    render(<MonitorDashboard initialDisplays={[display]} />);
    expect(screen.getByTitle("Offline")).toBeInTheDocument();
  });
});
