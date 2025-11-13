import { describe, it, expect } from "vitest";
import { render, screen } from "@/lib/test-utils";
import PlaylistsPage from "@/app/controller/playlists/page";

// Mock the prisma module
vi.mock("@/lib/db", () => ({
  prisma: {
    playlist: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

const mockPlaylists = [
  {
    id: "p1",
    name: "Playlist 1",
    description: "Test playlist 1",
    playbackMode: "LOOP",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    displays: [
      {
        id: "dp1",
        displayId: "1",
        playlistId: "p1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        display: {
          id: "1",
          name: "Display 1",
          description: "Test display 1",
          token: "token123",
          isActive: true,
          lastSeenAt: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      },
    ],
    _count: {
      items: 5,
    },
  },
  {
    id: "p2",
    name: "Playlist 2",
    description: null,
    playbackMode: "SEQUENCE",
    isActive: false,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    displays: [
      {
        id: "dp2",
        displayId: "2",
        playlistId: "p2",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        display: {
          id: "2",
          name: "Display 2",
          description: null,
          token: "token456",
          isActive: false,
          lastSeenAt: null,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    ],
    _count: {
      items: 0,
    },
  },
];

describe("PlaylistsPage Component", () => {
  it("should render playlists heading", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue(mockPlaylists);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Playlists")).toBeInTheDocument();
  });

  it("should render playlists with names", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue(mockPlaylists);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Playlist 1")).toBeInTheDocument();
    expect(screen.getByText("Playlist 2")).toBeInTheDocument();
  });

  it("should show playlist details", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue(mockPlaylists);

    const Page = await PlaylistsPage();
    render(Page);

    // Check playback modes
    expect(screen.getByText(/loop/i)).toBeInTheDocument();
    expect(screen.getByText(/sequence/i)).toBeInTheDocument();

    // Check video count
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();

    // Check active/inactive status
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should render edit playlist buttons", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue(mockPlaylists);

    const Page = await PlaylistsPage();
    render(Page);

    const editButtons = screen.getAllByText("Edit Playlist");
    expect(editButtons).toHaveLength(2);
  });

  it("should show empty state when no playlists exist", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue([]);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("No playlists found")).toBeInTheDocument();
    expect(
      screen.getByText("Create a playlist by configuring a display")
    ).toBeInTheDocument();
    expect(screen.getByText("Go to Displays")).toBeInTheDocument();
  });

  it("should render playlist descriptions when available", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue(mockPlaylists);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Test playlist 1")).toBeInTheDocument();
  });

  it("should render correct links to edit playlists", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue([mockPlaylists[0]]);

    const Page = await PlaylistsPage();
    render(Page);

    const editLink = screen.getByText("Edit Playlist").closest("a");
    expect(editLink).toHaveAttribute("href", "/controller/playlists/p1");
  });

  it("should show active status badge for active playlists", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue([mockPlaylists[0]]);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should show inactive status badge for inactive playlists", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue([mockPlaylists[1]]);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should display video count for playlists", async () => {
    vi.mocked(prisma.playlist.findMany).mockResolvedValue([mockPlaylists[0]]);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText(/Videos:/)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
