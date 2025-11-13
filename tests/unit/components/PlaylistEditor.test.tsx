import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/lib/test-utils";
import PlaylistEditor from "@/components/controller/PlaylistEditor";
import type { Display, Playlist, PlaylistItem, Video, DisplayPlaylist } from "@/lib/generated/prisma";

// Mock fetch
global.fetch = vi.fn();

// Mock confirm
global.confirm = vi.fn();

type PlaylistWithDetails = Playlist & {
  items: (PlaylistItem & {
    video: Video;
  })[];
  displays: (DisplayPlaylist & {
    display: Display;
  })[];
};

describe("PlaylistEditor", () => {
  const mockDisplay: Display = {
    id: "display-1",
    name: "Test Display",
    token: "test-token-123",
    description: "Test Description",
    isActive: true,
    lastSeenAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockPlaylist: PlaylistWithDetails = {
    id: "playlist-1",
    name: "Test Playlist",
    description: null,
    playbackMode: "SEQUENCE",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    displays: [
      {
        id: "dp-1",
        displayId: mockDisplay.id,
        playlistId: "playlist-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        display: mockDisplay,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render playlist name", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });

  it("should show edit button for playlist name", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("should show assigned displays", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText(/assigned to:/i)).toBeInTheDocument();
    expect(screen.getByText(/test display/i)).toBeInTheDocument();
  });

  it("should render empty playlist message when no items", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText(/no videos in playlist/i)).toBeInTheDocument();
  });

  it("should display available videos to add", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText("Video 1")).toBeInTheDocument();
    expect(screen.getByText("Video 2")).toBeInTheDocument();
  });

  it("should add video to playlist when add button is clicked", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "item-1",
        playlistId: "playlist-1",
        videoId: "video-1",
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as Response);

    const { user } = render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    const addButtons = screen.getAllByRole("button", { name: /add/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ videoId: "video-1" }),
        })
      );
    });
  });

  it("should remove video from playlist when remove button is clicked", async () => {
    const playlistWithItems: PlaylistWithDetails = {
      ...mockPlaylist,
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
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const { user } = render(
      <PlaylistEditor
        playlist={playlistWithItems}
        availableVideos={mockVideos}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items/item-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  it("should change playback mode when mode selector is changed", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockPlaylist,
        playbackMode: "LOOP",
      }),
    } as Response);

    const { user } = render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    const select = screen.getByRole("combobox", { name: /playback mode/i });
    await user.selectOptions(select, "LOOP");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ playbackMode: "LOOP" }),
        })
      );
    });
  });

  it("should display playlist items in correct order", () => {
    const playlistWithItems: PlaylistWithDetails = {
      ...mockPlaylist,
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
    };

    render(
      <PlaylistEditor
        playlist={playlistWithItems}
        availableVideos={mockVideos}
      />
    );

    const items = screen.getAllByTestId(/playlist-item/i);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Video 1");
    expect(items[1]).toHaveTextContent("Video 2");
  });

  it("should show delete playlist button", () => {
    render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByRole("button", { name: /delete playlist/i })).toBeInTheDocument();
  });

  it("should delete playlist when delete button is clicked and confirmed", async () => {
    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: "" };

    const { user } = render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete playlist/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    expect(window.location.href).toBe("/controller/playlists");
  });

  it("should not delete playlist when delete is cancelled", async () => {
    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

    const { user } = render(
      <PlaylistEditor
        playlist={mockPlaylist}
        availableVideos={mockVideos}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete playlist/i });
    await user.click(deleteButton);

    // Should not make API call
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
