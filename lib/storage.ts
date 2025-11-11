import { StorageProvider } from "./storage/interface";
import { LocalStorageProvider } from "./storage/local";
import { VercelBlobStorageProvider } from "./storage/vercel";

// Choose storage provider based on environment
function getStorageProvider(): StorageProvider {
  // Use local storage for development/testing unless explicitly configured for Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "production") {
    return new VercelBlobStorageProvider();
  }
  return new LocalStorageProvider();
}

const storageProvider = getStorageProvider();

/**
 * Upload a video file to storage
 */
export async function uploadVideo(
  file: File | Buffer,
  filename: string
): Promise<{ url: string; size: number }> {
  return storageProvider.uploadVideo(file, filename);
}

/**
 * Delete a video file from storage
 */
export async function deleteVideo(url: string): Promise<void> {
  return storageProvider.deleteVideo(url);
}
