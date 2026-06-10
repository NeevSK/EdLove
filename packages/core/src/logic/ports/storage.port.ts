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
}

export interface IFileStoragePort {
  /**
   * Upload a file and return the public URL.
   */
  upload(fileUri: string, options?: FileUploadOptions): Promise<string>;

  /**
   * Delete a file by its identifier or URL.
   */
  delete(identifier: string): Promise<void>;

  /**
   * Get a public URL for a given path.
   */
  getPublicUrl(path: string): string;
}
