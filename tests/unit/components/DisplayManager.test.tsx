import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/lib/test-utils";
import DisplayManager from "@/components/controller/DisplayManager";
import type { Display, Playlist } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlists: Array<{
    playlist: Playlist & {
      items: any[];
    };
  }>;
};

const mockDisplays: DisplayWithPlaylist[] = [
  {
    id: "1",
    name: "Lobby Display",
    description: "Main lobby screen",
    token: "token123token123token123token123",
    isActive: true,
    lastSeenAt: new Date("2024-01-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    playlists: [],
  },
  {
    id: "2",
    name: "Conference Room",
    description: null,
    token: "token456token456token456token456",
    isActive: false,
    lastSeenAt: null,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    playlists: [],
  },
];

// Mock fetch
global.fetch = vi.fn();

// Mock confirm
global.confirm = vi.fn();

describe("DisplayManager Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render display list", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    expect(screen.getByText("Lobby Display")).toBeInTheDocument();
    expect(screen.getByText("Conference Room")).toBeInTheDocument();
  });

  it("should show new display button", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    expect(screen.getByText("+ New Display")).toBeInTheDocument();
  });

  it("should show empty state when no displays", () => {
    render(<DisplayManager initialDisplays={[]} availablePlaylists={[]} />);

    expect(screen.getByText("No displays registered")).toBeInTheDocument();
  });

  it("should display active/inactive status", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should show create form when new display button clicked", async () => {
    const { user } = render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    const newButton = screen.getByText("+ New Display");
    await user.click(newButton);

    expect(screen.getByText("Register New Display")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., Lobby Display")).toBeInTheDocument();
  });

  it("should hide create form when cancel clicked", async () => {
    const { user } = render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    await user.click(screen.getByText("+ New Display"));
    expect(screen.getByText("Register New Display")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Register New Display")).not.toBeInTheDocument();
  });

  it("should create new display", async () => {
    const { user } = render(<DisplayManager initialDisplays={[]} availablePlaylists={[]} />);

    const mockResponse = {
      id: "new-id",
      name: "New Display",
      description: "Test description",
      token: "newtokennewtokennewtokennewtoken",
      isActive: true,
      lastSeenAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await user.click(screen.getByText("+ New Display"));

    const nameInput = screen.getByPlaceholderText("e.g., Lobby Display");
    const descInput = screen.getByPlaceholderText("Optional description");

    await user.type(nameInput, "New Display");
    await user.type(descInput, "Test description");

    await user.click(screen.getByText("Create Display"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/displays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Display",
          description: "Test description",
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("New Display")).toBeInTheDocument();
    });
  });

  it("should display description when available", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    expect(screen.getByText("Main lobby screen")).toBeInTheDocument();
  });

  it("should display last seen time when available", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    // Check for "Last seen:" text
    expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
  });

  it("should render delete button for each display", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    const deleteButtons = screen.getAllByText("Delete Display");
    expect(deleteButtons).toHaveLength(2);
  });

  it("should delete display when confirmed", async () => {
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const { user } = render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    const deleteButtons = screen.getAllByText("Delete Display");
    await user.click(deleteButtons[0]);

    // Check confirm was called
    expect(confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Lobby Display"? This will also delete its playlist.'
    );

    // Check API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/displays/1", {
        method: "DELETE",
      });
    });

    // Check display was removed from UI
    await waitFor(() => {
      expect(screen.queryByText("Lobby Display")).not.toBeInTheDocument();
    });

    // Second display should still be there
    expect(screen.getByText("Conference Room")).toBeInTheDocument();
  });

  it("should not delete display when cancelled", async () => {
    vi.mocked(confirm).mockReturnValue(false);

    const { user } = render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    const deleteButtons = screen.getAllByText("Delete Display");
    await user.click(deleteButtons[0]);

    // Check confirm was called
    expect(confirm).toHaveBeenCalled();

    // Check API was NOT called
    expect(fetch).not.toHaveBeenCalled();

    // Both displays should still be there
    expect(screen.getByText("Lobby Display")).toBeInTheDocument();
    expect(screen.getByText("Conference Room")).toBeInTheDocument();
  });

  it("should show playlist selector dropdown for displays with playlist", () => {
    const displaysWithPlaylist: DisplayWithPlaylist[] = [{
      ...mockDisplays[0],
      playlists: [{
        playlist: {
          id: "playlist-1",
          displayId: "1",
          name: "Test Playlist",
          description: null,
          playbackMode: "SEQUENCE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        }
      }]
    }];

    render(<DisplayManager initialDisplays={displaysWithPlaylist} availablePlaylists={[]} />);

    expect(screen.getByLabelText(/Current Playlist/i)).toBeInTheDocument();
  });

  it("should call API to change playlist when selection changes", async () => {
    const mockPlaylists = [
      { id: "playlist-1", name: "Playlist 1" },
      { id: "playlist-2", name: "Playlist 2" },
    ];

    const displaysWithPlaylist: DisplayWithPlaylist[] = [{
      ...mockDisplays[0],
      playlists: [{
        playlist: {
          id: "playlist-1",
          displayId: "1",
          name: "Playlist 1",
          description: null,
          playbackMode: "SEQUENCE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        }
      }]
    }];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { user } = render(
      <DisplayManager initialDisplays={displaysWithPlaylist} availablePlaylists={mockPlaylists as any} />
    );

    const select = screen.getByLabelText(/Current Playlist/i);
    await user.selectOptions(select, "playlist-2");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/displays/1/playlist",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ playlistId: "playlist-2" }),
        })
      );
    });
  });

  it("should show all available playlists in dropdown", () => {
    const mockPlaylists = [
      { id: "p1", name: "Playlist A", displayId: null, description: null, playbackMode: "SEQUENCE", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "p2", name: "Playlist B", displayId: null, description: null, playbackMode: "LOOP", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "p3", name: "Playlist C", displayId: null, description: null, playbackMode: "SEQUENCE", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={mockPlaylists as any} />);

    const select = screen.getAllByLabelText(/Current Playlist/i)[0];
    expect(select).toBeInTheDocument();

    // Check all playlists are in the dropdown
    const options = select.querySelectorAll('option');
    const optionTexts = Array.from(options).map(opt => opt.textContent);
    expect(optionTexts).toContain("Playlist A");
    expect(optionTexts).toContain("Playlist B");
    expect(optionTexts).toContain("Playlist C");
  });

  it("should show 'No Playlist' option in dropdown", () => {
    render(<DisplayManager initialDisplays={mockDisplays} availablePlaylists={[]} />);

    const select = screen.getAllByLabelText(/Current Playlist/i)[0];
    expect(select.querySelector('option[value=""]')).toHaveTextContent("No Playlist");
  });

  it("should call API to remove playlist when 'No Playlist' selected", async () => {
    const displaysWithPlaylist: DisplayWithPlaylist[] = [{
      ...mockDisplays[0],
      playlists: [{
        playlist: {
          id: "playlist-1",
          displayId: "1",
          name: "Test Playlist",
          description: null,
          playbackMode: "SEQUENCE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        }
      }]
    }];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { user } = render(
      <DisplayManager initialDisplays={displaysWithPlaylist} availablePlaylists={[]} />
    );

    const select = screen.getByLabelText(/Current Playlist/i);
    await user.selectOptions(select, "");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/displays/1/playlist",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ playlistId: null }),
        })
      );
    });
  });

  it("should show Configure Playlist button only when display has playlist", () => {
    const displaysWithAndWithoutPlaylist: DisplayWithPlaylist[] = [
      {
        ...mockDisplays[0],
        playlists: [{
          playlist: {
            id: "playlist-1",
            displayId: "1",
            name: "Test Playlist",
            description: null,
            playbackMode: "SEQUENCE",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [],
          }
        }]
      },
      {
        ...mockDisplays[1],
        playlists: []
      }
    ];

    render(<DisplayManager initialDisplays={displaysWithAndWithoutPlaylist} availablePlaylists={[]} />);

    // First display should have Configure Playlist button
    const configureButtons = screen.queryAllByText("Configure Playlist");
    expect(configureButtons).toHaveLength(1);
  });

  it("should display video count when display has playlist with videos", () => {
    const displaysWithVideos: DisplayWithPlaylist[] = [{
      ...mockDisplays[0],
      playlists: [{
        playlist: {
          id: "playlist-1",
          displayId: "1",
          name: "Test Playlist",
          description: null,
          playbackMode: "SEQUENCE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            { id: "i1", playlistId: "playlist-1", videoId: "v1", position: 0, createdAt: new Date(), updatedAt: new Date(), video: {} as any },
            { id: "i2", playlistId: "playlist-1", videoId: "v2", position: 1, createdAt: new Date(), updatedAt: new Date(), video: {} as any },
            { id: "i3", playlistId: "playlist-1", videoId: "v3", position: 2, createdAt: new Date(), updatedAt: new Date(), video: {} as any },
          ],
        }
      }]
    }];

    render(<DisplayManager initialDisplays={displaysWithVideos} availablePlaylists={[]} />);

    expect(screen.getByText("3 videos")).toBeInTheDocument();
  });

  it("should update UI when playlist changed successfully", async () => {
    const mockPlaylists = [
      { id: "p1", name: "Playlist A", displayId: null, description: null, playbackMode: "SEQUENCE", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "p2", name: "Playlist B", displayId: null, description: null, playbackMode: "LOOP", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    const displaysWithPlaylist: DisplayWithPlaylist[] = [{
      ...mockDisplays[0],
      playlists: [{
        playlist: {
          id: "p1",
          displayId: "1",
          name: "Playlist A",
          description: null,
          playbackMode: "SEQUENCE",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        }
      }]
    }];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { user } = render(
      <DisplayManager initialDisplays={displaysWithPlaylist} availablePlaylists={mockPlaylists as any} />
    );

    const select = screen.getByLabelText(/Current Playlist/i);

    // Initially should show p1
    expect(select).toHaveValue("p1");

    // Change to p2
    await user.selectOptions(select, "p2");

    await waitFor(() => {
      expect(select).toHaveValue("p2");
    });
  });

  it("should show error alert when playlist change fails", async () => {
    const mockPlaylists = [
      { id: "p1", name: "Playlist A", displayId: null, description: null, playbackMode: "SEQUENCE", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { user } = render(
      <DisplayManager initialDisplays={mockDisplays} availablePlaylists={mockPlaylists as any} />
    );

    const select = screen.getAllByLabelText(/Current Playlist/i)[0];
    await user.selectOptions(select, "p1");

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to update playlist. Please try again.");
    });

    alertSpy.mockRestore();
  });
});
