import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/lib/test-utils";
import VideoUpload from "@/components/controller/VideoUpload";

// Mock fetch
global.fetch = vi.fn();

describe("VideoUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render upload form", () => {
    render(<VideoUpload onUploadComplete={vi.fn()} />);

    expect(screen.getByLabelText(/video file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("should show description field", () => {
    render(<VideoUpload onUploadComplete={vi.fn()} />);

    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("should disable upload button when no file selected", () => {
    render(<VideoUpload onUploadComplete={vi.fn()} />);

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it("should enable upload button when file and title provided", async () => {
    const { user } = render(<VideoUpload onUploadComplete={vi.fn()} />);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const fileInput = screen.getByLabelText(/video file/i);
    const titleInput = screen.getByLabelText(/title/i);

    await user.upload(fileInput, file);
    await user.type(titleInput, "Test Video");

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    expect(uploadButton).toBeEnabled();
  });

  it("should upload video successfully", async () => {
    const mockVideo = {
      id: "video-1",
      title: "Test Video",
      description: "Test Description",
      blobUrl: "https://example.com/video.mp4",
      mimeType: "video/mp4",
      fileSize: 1024000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideo,
    });

    const onUploadComplete = vi.fn();
    const { user } = render(<VideoUpload onUploadComplete={onUploadComplete} />);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const fileInput = screen.getByLabelText(/video file/i);
    const titleInput = screen.getByLabelText(/title/i);
    const descInput = screen.getByLabelText(/description/i);

    await user.upload(fileInput, file);
    await user.type(titleInput, "Test Video");
    await user.type(descInput, "Test Description");

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/videos",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalledWith(mockVideo);
    });
  });

  it("should show uploading state", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    const { user } = render(<VideoUpload onUploadComplete={vi.fn()} />);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const fileInput = screen.getByLabelText(/video file/i);
    const titleInput = screen.getByLabelText(/title/i);

    await user.upload(fileInput, file);
    await user.type(titleInput, "Test Video");

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await user.click(uploadButton);

    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();
  });

  it("should show error message on upload failure", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Upload failed" }),
    });

    const { user } = render(<VideoUpload onUploadComplete={vi.fn()} />);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const fileInput = screen.getByLabelText(/video file/i);
    const titleInput = screen.getByLabelText(/title/i);

    await user.upload(fileInput, file);
    await user.type(titleInput, "Test Video");

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it("should reset form after successful upload", async () => {
    const mockVideo = {
      id: "video-1",
      title: "Test Video",
      blobUrl: "https://example.com/video.mp4",
      mimeType: "video/mp4",
      fileSize: 1024000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideo,
    });

    const { user } = render(<VideoUpload onUploadComplete={vi.fn()} />);

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const fileInput = screen.getByLabelText(/video file/i);
    const titleInput = screen.getByLabelText(/title/i);

    await user.upload(fileInput, file);
    await user.type(titleInput, "Test Video");

    const uploadButton = screen.getByRole("button", { name: /upload/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });

  it("should only accept video files", () => {
    render(<VideoUpload onUploadComplete={vi.fn()} />);

    const fileInput = screen.getByLabelText(/video file/i) as HTMLInputElement;
    expect(fileInput.accept).toContain("video/*");
  });
});
