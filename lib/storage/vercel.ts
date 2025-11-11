import { put, del } from "@vercel/blob";
import { StorageProvider, UploadResult } from "./interface";

export class VercelBlobStorageProvider implements StorageProvider {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.BLOB_READ_WRITE_TOKEN || "";
    if (!this.token) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }
  }

  async uploadVideo(file: File | Buffer, filename: string): Promise<UploadResult> {
    const blob = await put(filename, file, {
      access: "public",
      token: this.token,
    });

    return {
      url: blob.url,
      size: blob.size,
    };
  }

  async deleteVideo(url: string): Promise<void> {
    await del(url, {
      token: this.token,
    });
  }
}
