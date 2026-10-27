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
