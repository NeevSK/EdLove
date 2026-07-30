import type { FileUploadOptions, IFileStoragePort } from '@repo/core/logic/ports/storage.port';

/**
 * MediaManager
 *
 * Orchestrates file and asset storage operations.
 * Allows the application to be agnostic of the underlying storage provider
 * (Cloudinary, Supabase Storage, S3, etc).
 */
export class MediaManager {
  constructor(public adapter: IFileStoragePort) {}

  /**
   * Uploads a file to the configured storage provider.
   */
  async upload(fileUri: string, options?: FileUploadOptions): Promise<string> {
    return this.adapter.upload(fileUri, options);
  }

  /**
   * Deletes a file from the configured storage provider.
   */
  async delete(identifier: string): Promise<void> {
    return this.adapter.delete(identifier);
  }

  /**
   * Generates a public URL for a given path.
   */
  getPublicUrl(path: string): string {
    return this.adapter.getPublicUrl(path);
  }
}
