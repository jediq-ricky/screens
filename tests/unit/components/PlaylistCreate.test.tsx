import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import PlaylistCreate from "@/components/controller/PlaylistCreate";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("PlaylistCreate", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    global.fetch = vi.fn();
  });

  it("should render create button initially", () => {
    render(<PlaylistCreate />);
    expect(screen.getByText("Create Playlist")).toBeInTheDocument();
  });

  it("should open modal when create button is clicked", () => {
    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));
    expect(screen.getByText("Create New Playlist")).toBeInTheDocument();
  });

  it("should render form fields in modal", () => {
    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Playback Mode/)).toBeInTheDocument();
  });

  it("should close modal when cancel is clicked", () => {
    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));
    expect(screen.getByText("Create New Playlist")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Create New Playlist")).not.toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    const mockPlaylist = {
      id: "playlist-123",
      name: "Test Playlist",
      description: "Test description",
      playbackMode: "SEQUENCE",
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockPlaylist,
    });

    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const nameInput = screen.getByLabelText(/Name/);
    const descriptionInput = screen.getByLabelText(/Description/);
    const playbackModeSelect = screen.getByLabelText(/Playback Mode/);

    fireEvent.change(nameInput, { target: { value: "Test Playlist" } });
    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(playbackModeSelect, { target: { value: "LOOP" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Playlist",
          description: "Test description",
          playbackMode: "LOOP",
        }),
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/controller/playlists/playlist-123");
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("should submit form without optional description", async () => {
    const mockPlaylist = {
      id: "playlist-123",
      name: "Test Playlist",
      playbackMode: "SEQUENCE",
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockPlaylist,
    });

    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const nameInput = screen.getByLabelText(/Name/);
    fireEvent.change(nameInput, { target: { value: "Test Playlist" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Playlist",
          description: undefined,
          playbackMode: "SEQUENCE",
        }),
      });
    });
  });

  it("should display error message on failed submission", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Name already exists" }),
    });

    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const nameInput = screen.getByLabelText(/Name/);
    fireEvent.change(nameInput, { target: { value: "Test Playlist" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("Name already exists")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should disable form during submission", async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: "playlist-123", name: "Test" }),
              }),
            100
          )
        )
    );

    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const nameInput = screen.getByLabelText(/Name/);
    fireEvent.change(nameInput, { target: { value: "Test Playlist" } });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(screen.getByText("Creating...")).toBeInTheDocument();
    });

    expect(nameInput).toBeDisabled();
  });

  it("should default to SEQUENCE playback mode", () => {
    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const playbackModeSelect = screen.getByLabelText(/Playback Mode/) as HTMLSelectElement;
    expect(playbackModeSelect.value).toBe("SEQUENCE");
  });

  it("should support all playback modes", () => {
    render(<PlaylistCreate />);
    fireEvent.click(screen.getByText("Create Playlist"));

    const playbackModeSelect = screen.getByLabelText(/Playback Mode/);
    const options = Array.from(playbackModeSelect.querySelectorAll("option"));

    expect(options).toHaveLength(3);
    expect(options.map((opt) => opt.value)).toEqual(["SEQUENCE", "LOOP", "MANUAL"]);
  });
});
