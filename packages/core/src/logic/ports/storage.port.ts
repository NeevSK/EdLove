/**
 * IFileStoragePort
 *
 * Framework-agnostic port for file operations.
 * Allows the platform to swap between Cloudinary, Supabase Storage, S3, or Local Disk
 * without changing domain logic.
 */

export interface FileUploadOptions {
  path?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  tags?: string[];
  sha256?: string;
  onProgress?: (percent: number) => void;
}

export interface IFileStoragePort {
  /**
   * Upload a file and return the public URL.
   */
  upload(fileUri: string, options?: FileUploadOptions): Promise<string>;

  /**
   * Upload a browser Blob directly (used by web outbox & presigned flows).
   */
  uploadBlob?(blob: Blob, options?: FileUploadOptions): Promise<string>;

  /**
   * Delete a file by its identifier or URL.
   */
  delete(identifier: string): Promise<void>;

  /**
   * Get a public URL for a given path.
   */
  getPublicUrl(path: string): string;

  /**
   * Resolve a short-lived signed download URL when the asset is private.
   */
  createDownloadUrl?(identifier: string): Promise<string>;
}
