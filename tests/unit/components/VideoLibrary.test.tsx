import { describe, it, expect } from "vitest";
import { render, screen } from "@/lib/test-utils";
import VideoLibrary from "@/components/controller/VideoLibrary";
import type { Video } from "@/lib/generated/prisma";

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Test Video 1",
    description: "A test video",
    blobUrl: "https://example.com/video1.mp4",
    thumbnailUrl: null,
    duration: 120,
    fileSize: 1024000,
    mimeType: "video/mp4",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    title: "Test Video 2",
    description: null,
    blobUrl: "https://example.com/video2.mp4",
    thumbnailUrl: null,
    duration: 180,
    fileSize: 2048000,
    mimeType: "video/mp4",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
];

describe("VideoLibrary Component", () => {
  it("should render video list", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
    expect(screen.getByText("Test Video 2")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    const searchInput = screen.getByPlaceholderText("Search videos...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should filter videos by search query", async () => {
    const { user } = render(<VideoLibrary initialVideos={mockVideos} />);

    const searchInput = screen.getByPlaceholderText("Search videos...");
    await user.type(searchInput, "Video 1");

    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
    expect(screen.queryByText("Test Video 2")).not.toBeInTheDocument();
  });

  it("should show empty state when no videos", () => {
    render(<VideoLibrary initialVideos={[]} />);

    expect(screen.getByText("No videos found")).toBeInTheDocument();
  });

  it("should display video duration", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    // 120 seconds = 2:00
    expect(screen.getByText("2:00")).toBeInTheDocument();
    // 180 seconds = 3:00
    expect(screen.getByText("3:00")).toBeInTheDocument();
  });

  it("should display video file size", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    // 1024000 bytes ≈ 1.0 MB
    expect(screen.getByText("1.0 MB")).toBeInTheDocument();
    // 2048000 bytes ≈ 2.0 MB
    expect(screen.getByText("2.0 MB")).toBeInTheDocument();
  });

  it("should render video description when available", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    expect(screen.getByText("A test video")).toBeInTheDocument();
  });

  it("should be case-insensitive in search", async () => {
    const { user } = render(<VideoLibrary initialVideos={mockVideos} />);

    const searchInput = screen.getByPlaceholderText("Search videos...");
    await user.type(searchInput, "test video 1");

    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
  });

  it("should render delete button for each video", () => {
    render(<VideoLibrary initialVideos={mockVideos} />);

    const deleteButtons = screen.getAllByText("Delete");
    expect(deleteButtons).toHaveLength(2);
  });

  it("should delete video when delete button is clicked and confirmed", async () => {
    global.confirm = () => true;
    global.fetch = async () =>
      new Response(null, { status: 204 }) as Response;

    const { user } = render(<VideoLibrary initialVideos={mockVideos} />);

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    // First video should be removed
    expect(screen.queryByText("Test Video 1")).not.toBeInTheDocument();
    // Second video should still be there
    expect(screen.getByText("Test Video 2")).toBeInTheDocument();
  });

  it("should not delete video when delete is cancelled", async () => {
    global.confirm = () => false;

    const { user } = render(<VideoLibrary initialVideos={mockVideos} />);

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    // Both videos should still be there
    expect(screen.getByText("Test Video 1")).toBeInTheDocument();
    expect(screen.getByText("Test Video 2")).toBeInTheDocument();
  });
});
