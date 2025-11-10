import { put, del, list } from "@vercel/blob";

/**
 * Upload a video file to Vercel Blob storage
 */
export async function uploadVideo(
  file: File | Buffer,
  filename: string
): Promise<{ url: string; size: number }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const blob = await put(filename, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    size: blob.size,
  };
}

/**
 * Delete a video file from Vercel Blob storage
 */
export async function deleteVideo(url: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

/**
 * List all videos in Vercel Blob storage
 */
export async function listVideos() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  const { blobs } = await list({
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blobs;
}
