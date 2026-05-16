import { MediaManager } from './MediaManager';
import { createCloudinaryAdapter } from '../../adapters/storage/cloudinary.adapter';

/**
 * media: The Global Sovereign Media Instance.
 */
export const media = new MediaManager(createCloudinaryAdapter());
