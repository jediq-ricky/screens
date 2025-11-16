import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import TriggerController from "@/components/controller/TriggerController";
import type { Display, Playlist, PlaylistItem, Video, DisplayPlaylist } from "@/lib/generated/prisma";

type DisplayWithPlaylist = Display & {
  playlists: Array<DisplayPlaylist & {
    playlist: Playlist & {
      items: (PlaylistItem & {
        video: Video;
      })[];
    };
  }>;
};

describe("TriggerController", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const mockVideo: Video = {
    id: "video-1",
    title: "Fire Video",
    description: "Fire video description",
    blobUrl: "https://example.com/fire.mp4",
    thumbnailUrl: null,
    duration: 120,
    fileSize: 1024000,
    mimeType: "video/mp4",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisplay: DisplayWithPlaylist = {
    id: "display-1",
    name: "Test Display",
    token: "test-token",
    description: "Test Description",
    isActive: true,
    showControls: true,
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [
      {
        id: "dp-1",
        displayId: "display-1",
        playlistId: "playlist-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        playlist: {
          id: "playlist-1",
          displayId: null,
          name: "Test Playlist",
          description: null,
          playbackMode: "MANUAL",
          videoGap: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "item-1",
              playlistId: "playlist-1",
              videoId: "video-1",
              position: 0,
              triggerType: "KEYBOARD",
              triggerConfig: { key: "1" },
              createdAt: new Date(),
              updatedAt: new Date(),
              video: mockVideo,
            },
          ],
        },
      },
    ],
  };

  it("should not render for non-MANUAL playlists", () => {
    const sequenceDisplay: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            playbackMode: "SEQUENCE",
          },
        },
      ],
    };

    const { container } = render(<TriggerController display={sequenceDisplay} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render triggers section for MANUAL playlists", () => {
    render(<TriggerController display={mockDisplay} />);
    expect(screen.getByText("Triggers")).toBeInTheDocument();
  });

  it("should render Listen for Keys button when keyboard triggers exist", () => {
    render(<TriggerController display={mockDisplay} />);
    expect(screen.getByRole("button", { name: /listen for keys/i })).toBeInTheDocument();
  });

  it("should toggle listening state when Listen for Keys button is clicked", () => {
    render(<TriggerController display={mockDisplay} />);
    const button = screen.getByRole("button", { name: /listen for keys/i });

    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /listening/i })).toBeInTheDocument();
  });

  it("should display video with trigger configuration", () => {
    render(<TriggerController display={mockDisplay} />);
    expect(screen.getByText("Fire Video")).toBeInTheDocument();
    expect(screen.getByText("Key: 1")).toBeInTheDocument();
  });

  it("should have Trigger button for each video", () => {
    render(<TriggerController display={mockDisplay} />);
    expect(screen.getByRole("button", { name: /^trigger$/i })).toBeInTheDocument();
  });

  it("should send skip command when Trigger button is clicked", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;

    render(<TriggerController display={mockDisplay} />);
    const triggerButton = screen.getByRole("button", { name: /^trigger$/i });

    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/displays/display-1/control",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "skip", index: 0 }),
        })
      );
    });
  });

  it("should show message when no triggers are configured", () => {
    const displayWithoutTriggers: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            items: [
              {
                ...mockDisplay.playlists[0].playlist.items[0],
                triggerType: "NONE",
                triggerConfig: null,
              },
            ],
          },
        },
      ],
    };

    render(<TriggerController display={displayWithoutTriggers} />);
    expect(screen.getByText(/no triggers configured/i)).toBeInTheDocument();
  });

  it("should display correct label for CLICK trigger", () => {
    const displayWithClickTrigger: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            items: [
              {
                ...mockDisplay.playlists[0].playlist.items[0],
                triggerType: "CLICK",
                triggerConfig: { x: 100, y: 200 },
              },
            ],
          },
        },
      ],
    };

    render(<TriggerController display={displayWithClickTrigger} />);
    expect(screen.getByText("Click at (100, 200)")).toBeInTheDocument();
  });

  it("should display correct label for WEBCAM trigger", () => {
    const displayWithWebcamTrigger: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            items: [
              {
                ...mockDisplay.playlists[0].playlist.items[0],
                triggerType: "WEBCAM",
                triggerConfig: { sensitivity: 75 },
              },
            ],
          },
        },
      ],
    };

    render(<TriggerController display={displayWithWebcamTrigger} />);
    expect(screen.getByText("Motion (75%)")).toBeInTheDocument();
  });

  it("should display correct label for MICROPHONE trigger", () => {
    const displayWithMicrophoneTrigger: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            items: [
              {
                ...mockDisplay.playlists[0].playlist.items[0],
                triggerType: "MICROPHONE",
                triggerConfig: { threshold: 60 },
              },
            ],
          },
        },
      ],
    };

    render(<TriggerController display={displayWithMicrophoneTrigger} />);
    expect(screen.getByText("Sound (60%)")).toBeInTheDocument();
  });

  it("should not render Listen for Keys button when no keyboard triggers exist", () => {
    const displayWithoutKeyboardTriggers: DisplayWithPlaylist = {
      ...mockDisplay,
      playlists: [
        {
          ...mockDisplay.playlists[0],
          playlist: {
            ...mockDisplay.playlists[0].playlist,
            items: [
              {
                ...mockDisplay.playlists[0].playlist.items[0],
                triggerType: "CLICK",
                triggerConfig: null,
              },
            ],
          },
        },
      ],
    };

    render(<TriggerController display={displayWithoutKeyboardTriggers} />);
    expect(screen.queryByRole("button", { name: /listen for keys/i })).not.toBeInTheDocument();
  });
});
