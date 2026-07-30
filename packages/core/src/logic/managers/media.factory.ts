import { createCloudinaryAdapter } from '@repo/core/adapters/storage/cloudinary.adapter';
import { MediaManager } from '@repo/core/logic/managers/MediaManager';

/**
 * media: The Global Sovereign Media Instance.
 */
export const media = new MediaManager(createCloudinaryAdapter());
