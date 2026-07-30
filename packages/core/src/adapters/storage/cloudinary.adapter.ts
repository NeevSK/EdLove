import { uploadToCloudinary } from '@repo/core/lib/cloudinary';
import type { IFileStoragePort } from '@repo/core/logic/ports/storage.port';

/**
 * CloudinaryAdapter
 *
 * Concrete implementation of IFileStoragePort for Cloudinary.
 */
export const createCloudinaryAdapter = (): IFileStoragePort => ({
  async upload(fileUri, options) {
    return uploadToCloudinary(
      fileUri,
      options?.resourceType === 'raw' ? 'auto' : options?.resourceType || 'image',
    );
  },

  async delete(_identifier) {
    console.warn('Cloudinary delete not implemented in adapter yet.');
  },

  getPublicUrl(path) {
    // Cloudinary usually returns the full URL on upload,
    // but we can construct it if we have the cloud name.
    return path;
  },
});
