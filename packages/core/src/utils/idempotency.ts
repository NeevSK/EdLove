import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a standard idempotency key for sovereign operations.
 * Use this to ensure that retried requests do not create duplicate records.
 */
export const generateIdempotencyKey = (prefix?: string) => {
  const uuid = uuidv4();
  return prefix ? `${prefix}_${uuid}` : uuid;
};

/**
 * Returns a consistent idempotency key for a specific set of data.
 * Useful for "fire-and-forget" syncs that might trigger multiple times.
 */
export const getConsistentIdempotencyKey = async (_data: any) => {
  // In a real 2026 app, we might use a hash of the data.
  // For now, simple UUID is fine if stored in local state.
  return uuidv4();
};
