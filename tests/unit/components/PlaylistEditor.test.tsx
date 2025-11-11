import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/lib/test-utils";
import PlaylistEditor from "@/components/controller/PlaylistEditor";
import type { Display, Playlist, PlaylistItem, Video } from "@/lib/generated/prisma";

// Mock fetch
global.fetch = vi.fn();

// Mock confirm
global.confirm = vi.fn();

type DisplayWithPlaylist = Display & {
  playlist: (Playlist & {
    items: (PlaylistItem & {
      video: Video;
    })[];
  }) | null;
};

describe("PlaylistEditor", () => {
  const mockDisplayWithoutPlaylist: DisplayWithPlaylist = {
    id: "display-1",
    name: "Test Display",
    token: "test-token-123",
    description: "Test Description",
    isActive: true,
    lastSeenAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    playlist: null,
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render display info and empty playlist state", () => {
    render(
      <PlaylistEditor
        display={mockDisplayWithoutPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText("Test Display")).toBeInTheDocument();
    expect(screen.getByText(/no playlist configured/i)).toBeInTheDocument();
  });

  it("should show create playlist button when no playlist exists", () => {
    render(
      <PlaylistEditor
        display={mockDisplayWithoutPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByRole("button", { name: /create playlist/i })).toBeInTheDocument();
  });

  it("should create a new playlist when button is clicked", async () => {
    const mockPlaylist = {
      id: "playlist-1",
      displayId: "display-1",
      playbackMode: "SEQUENCE",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaylist,
    });

    const { user } = render(
      <PlaylistEditor
        display={mockDisplayWithoutPlaylist}
        availableVideos={mockVideos}
      />
    );

    const createButton = screen.getByRole("button", { name: /create playlist/i });
    await user.click(createButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/playlists",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayId: "display-1",
            playbackMode: "SEQUENCE",
          }),
        })
      );
    });
  });

  it("should render playlist with items", () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
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
        ],
      },
    };

    render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText("Video 1")).toBeInTheDocument();
  });

  it("should display available videos to add", () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "LOOP",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByText("Video 1")).toBeInTheDocument();
    expect(screen.getByText("Video 2")).toBeInTheDocument();
  });

  it("should add video to playlist when add button is clicked", async () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    const mockPlaylistItem = {
      id: "item-1",
      playlistId: "playlist-1",
      videoId: "video-1",
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlaylistItem,
    });

    const { user } = render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    const addButtons = screen.getAllByRole("button", { name: /add/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: "video-1" }),
        })
      );
    });
  });

  it("should remove video from playlist when remove button is clicked", async () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
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
        ],
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { user } = render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    const removeButton = screen.getByRole("button", { name: /remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items/item-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  it("should change playback mode when mode selector is changed", async () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    const mockUpdatedPlaylist = {
      ...displayWithPlaylist.playlist,
      playbackMode: "LOOP",
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdatedPlaylist,
    });

    const { user } = render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    const select = screen.getByRole("combobox", { name: /playback mode/i });
    await user.selectOptions(select, "LOOP");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playbackMode: "LOOP" }),
        })
      );
    });
  });

  it("should display playlist items in correct order", () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
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

    render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    const items = screen.getAllByTestId(/playlist-item/i);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Video 1");
    expect(items[1]).toHaveTextContent("Video 2");
  });

  it("should show delete playlist button when playlist exists", () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    expect(screen.getByRole("button", { name: /delete playlist/i })).toBeInTheDocument();
  });

  it("should delete playlist when delete button is clicked and confirmed", async () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { user } = render(
      <PlaylistEditor
        display={displayWithPlaylist}
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

    // Should show the "no playlist" state
    expect(screen.getByText(/no playlist configured/i)).toBeInTheDocument();
  });

  it("should not delete playlist when delete is cancelled", async () => {
    const displayWithPlaylist: DisplayWithPlaylist = {
      ...mockDisplayWithoutPlaylist,
      playlist: {
        id: "playlist-1",
        displayId: "display-1",
        playbackMode: "SEQUENCE",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      },
    };

    (global.confirm as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

    const { user } = render(
      <PlaylistEditor
        display={displayWithPlaylist}
        availableVideos={mockVideos}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete playlist/i });
    await user.click(deleteButton);

    // Should not make API call
    expect(global.fetch).not.toHaveBeenCalled();

    // Playlist should still be there
    expect(screen.queryByText(/no playlist configured/i)).not.toBeInTheDocument();
  });
});
