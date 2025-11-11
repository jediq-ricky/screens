import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { StorageProvider, UploadResult } from "./interface";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "videos");
    this.baseUrl = "/uploads/videos";
  }

  async uploadVideo(file: File | Buffer, filename: string): Promise<UploadResult> {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    // Generate unique filename with high precision timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 11);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}-${randomSuffix}-${sanitizedFilename}`;
    const filepath = path.join(this.uploadDir, uniqueFilename);

    // Get file buffer
    let buffer: Buffer;
    let size: number;

    if (file instanceof Buffer) {
      buffer = file;
      size = buffer.length;
    } else {
      // File from FormData
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      size = buffer.length;
    }

    // Write file to disk
    await writeFile(filepath, buffer);

    // Return URL and size
    const url = `${this.baseUrl}/${uniqueFilename}`;
    return { url, size };
  }

  async deleteVideo(url: string): Promise<void> {
    // Extract filename from URL
    const filename = url.split("/").pop();
    if (!filename) {
      throw new Error("Invalid video URL");
    }

    const filepath = path.join(this.uploadDir, filename);

    // Delete file if it exists
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  }
}
