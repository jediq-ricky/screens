import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/lib/test-utils";
import DisplayManager from "@/components/controller/DisplayManager";
import type { Display, Playlist } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlist: Playlist | null;
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
    playlist: null,
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
    playlist: null,
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
    render(<DisplayManager initialDisplays={mockDisplays} />);

    expect(screen.getByText("Lobby Display")).toBeInTheDocument();
    expect(screen.getByText("Conference Room")).toBeInTheDocument();
  });

  it("should show new display button", () => {
    render(<DisplayManager initialDisplays={mockDisplays} />);

    expect(screen.getByText("+ New Display")).toBeInTheDocument();
  });

  it("should show empty state when no displays", () => {
    render(<DisplayManager initialDisplays={[]} />);

    expect(screen.getByText("No displays registered")).toBeInTheDocument();
  });

  it("should display active/inactive status", () => {
    render(<DisplayManager initialDisplays={mockDisplays} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should show create form when new display button clicked", async () => {
    const { user } = render(<DisplayManager initialDisplays={mockDisplays} />);

    const newButton = screen.getByText("+ New Display");
    await user.click(newButton);

    expect(screen.getByText("Register New Display")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., Lobby Display")).toBeInTheDocument();
  });

  it("should hide create form when cancel clicked", async () => {
    const { user } = render(<DisplayManager initialDisplays={mockDisplays} />);

    await user.click(screen.getByText("+ New Display"));
    expect(screen.getByText("Register New Display")).toBeInTheDocument();

    await user.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Register New Display")).not.toBeInTheDocument();
  });

  it("should create new display", async () => {
    const { user } = render(<DisplayManager initialDisplays={[]} />);

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
    render(<DisplayManager initialDisplays={mockDisplays} />);

    expect(screen.getByText("Main lobby screen")).toBeInTheDocument();
  });

  it("should display last seen time when available", () => {
    render(<DisplayManager initialDisplays={mockDisplays} />);

    // Check for "Last seen:" text
    expect(screen.getByText(/Last seen:/)).toBeInTheDocument();
  });

  it("should render delete button for each display", () => {
    render(<DisplayManager initialDisplays={mockDisplays} />);

    const deleteButtons = screen.getAllByText("Delete Display");
    expect(deleteButtons).toHaveLength(2);
  });

  it("should delete display when confirmed", async () => {
    vi.mocked(confirm).mockReturnValue(true);
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const { user } = render(<DisplayManager initialDisplays={mockDisplays} />);

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

    const { user } = render(<DisplayManager initialDisplays={mockDisplays} />);

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
});
