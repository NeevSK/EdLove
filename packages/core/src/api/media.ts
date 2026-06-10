import { media } from '../logic/managers/media.factory';
import type { FileUploadOptions } from '../logic/ports/storage.port';

/**
 * Media API
 *
 * Thin delegation layer to the Sovereign Media Manager.
 */
export const mediaAPI = {
  /**
   * Upload a file and return its public URL.
   */
  async upload(fileUri: string, options?: FileUploadOptions): Promise<string> {
    return media.upload(fileUri, options);
  },

  /**
   * Delete a file by its identifier.
   */
  async delete(identifier: string): Promise<void> {
    return media.delete(identifier);
  },

  /**
   * Get a public URL for a given path.
   */
  getPublicUrl(path: string): string {
    return media.getPublicUrl(path);
  },
};
