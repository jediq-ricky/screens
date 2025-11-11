export interface UploadResult {
  url: string;
  size: number;
}

export interface StorageProvider {
  uploadVideo(file: File | Buffer, filename: string): Promise<UploadResult>;
  deleteVideo(url: string): Promise<void>;
}
