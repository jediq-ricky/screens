import { describe, it, expect } from "vitest";
import { render, screen } from "@/lib/test-utils";
import PlaylistsPage from "@/app/controller/playlists/page";

// Mock the prisma module
vi.mock("@/lib/db", () => ({
  prisma: {
    display: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";

const mockDisplaysWithPlaylists = [
  {
    id: "1",
    name: "Display 1",
    description: "Test display 1",
    token: "token123",
    isActive: true,
    lastSeenAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    playlist: {
      id: "p1",
      displayId: "1",
      playbackMode: "LOOP",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      _count: {
        items: 5,
      },
    },
  },
  {
    id: "2",
    name: "Display 2",
    description: null,
    token: "token456",
    isActive: false,
    lastSeenAt: null,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
    playlist: null,
  },
];

describe("PlaylistsPage Component", () => {
  it("should render playlists heading", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Playlists")).toBeInTheDocument();
  });

  it("should render displays with playlists", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Display 1")).toBeInTheDocument();
    expect(screen.getByText("Display 2")).toBeInTheDocument();
  });

  it("should show playlist details for configured playlists", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    // Check playback mode
    expect(screen.getByText(/loop/i)).toBeInTheDocument();

    // Check video count
    expect(screen.getByText(/Videos:/)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Check active status
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should show 'No playlist configured' for displays without playlists", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("No playlist configured")).toBeInTheDocument();
  });

  it("should render edit/create playlist buttons", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Edit Playlist")).toBeInTheDocument();
    expect(screen.getByText("Create Playlist")).toBeInTheDocument();
  });

  it("should show empty state when no displays exist", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue([]);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("No displays found")).toBeInTheDocument();
    expect(
      screen.getByText("Create a display first to configure playlists")
    ).toBeInTheDocument();
    expect(screen.getByText("Go to Displays")).toBeInTheDocument();
  });

  it("should render display descriptions when available", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue(
      mockDisplaysWithPlaylists
    );

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Test display 1")).toBeInTheDocument();
  });

  it("should show inactive status badge", async () => {
    const inactiveDisplay = [
      {
        id: "3",
        name: "Display 3",
        description: null,
        token: "token789",
        isActive: true,
        lastSeenAt: null,
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-03"),
        playlist: {
          id: "p3",
          displayId: "3",
          playbackMode: "SEQUENCE",
          isActive: false,
          createdAt: new Date("2024-01-03"),
          updatedAt: new Date("2024-01-03"),
          _count: {
            items: 2,
          },
        },
      },
    ];

    vi.mocked(prisma.display.findMany).mockResolvedValue(inactiveDisplay);

    const Page = await PlaylistsPage();
    render(Page);

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("should render correct link to edit playlist", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue([
      mockDisplaysWithPlaylists[0],
    ]);

    const Page = await PlaylistsPage();
    render(Page);

    const editLink = screen.getByText("Edit Playlist").closest("a");
    expect(editLink).toHaveAttribute("href", "/controller/playlists/1");
  });

  it("should render correct link to create playlist", async () => {
    vi.mocked(prisma.display.findMany).mockResolvedValue([
      mockDisplaysWithPlaylists[1],
    ]);

    const Page = await PlaylistsPage();
    render(Page);

    const createLink = screen.getByText("Create Playlist").closest("a");
    expect(createLink).toHaveAttribute("href", "/controller/playlists/2");
  });
});
