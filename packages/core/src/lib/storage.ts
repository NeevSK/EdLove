/**
 * Unified Storage Gateway
 *
 * This file serves as the public API for storage. It delegates to the
 * StorageManager which uses the Adapter pattern to maintain platform agnosticism.
 */
export { storage } from '@repo/core/logic/managers/StorageManager';

export const StorageKeys = {
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync',
  CACHED_COMMUNITY_POSTS: 'cached_community_posts',
  CACHED_GROUPS: 'cached_groups',
  DRAFT_FORM: 'draft_form',
  DRAFT_STUDENTS: 'draft_students',
  DRAFT_THOUGHT_RECORD: 'draft_thought_record',
};

export interface PartitionKeyOptions {
  tenantId?: string | null;
  userId?: string | null;
  entityId?: string | null;
  feature: string;
  version?: string;
}

/**
 * Generates a strictly partitioned storage key.
 * Prevents cross-tenant leaks, shared device bleed, and multi-classroom collisions.
 *
 * Format: `<tenant>:<user>:<entity>:<feature>:<version>`
 */
export function buildPartitionedKey(options: PartitionKeyOptions): string {
  const tenant = options.tenantId?.trim() || 'global';
  const user = options.userId?.trim() || 'guest';
  const entity = options.entityId?.trim() || 'root';
  const version = options.version?.trim() || 'v6';
  return `${tenant}:${user}:${entity}:${options.feature}:${version}`;
}
