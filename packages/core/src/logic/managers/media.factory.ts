import { createCloudinaryAdapter } from '../../adapters/storage/cloudinary.adapter';
import { MediaManager } from './MediaManager';

/**
 * media: The Global Sovereign Media Instance.
 */
export const media = new MediaManager(createCloudinaryAdapter());
