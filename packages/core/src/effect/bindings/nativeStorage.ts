import { storage } from '@repo/core/native/storage';

/** The AsyncStorage-backed key-value store with a synchronous read cache (visit tracking). */
export const cachedDeviceStorage: typeof storage = storage;
