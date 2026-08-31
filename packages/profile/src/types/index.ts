import type { ProfileStats, User } from '@repo/core/types';

export type { ProfileStats };
export type UserProfile = User;

/**
 * OrientationSeeds is now part of the core User type.
 * We re-export it here for compatibility during migration.
 */
export type OrientationSeeds = Required<User>['orientation_seeds'];
export * from './negentropy';

