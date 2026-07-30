/**
 * Sovereign Domain Factory
 *
 * This module re-exports domain managers from their specialized factories.
 * Transitioning toward a Registry-based Inversion of Control (IoC).
 */

export * from '@repo/core/logic/managers/auth.factory';
export * from '@repo/core/logic/managers/authz.factory';
export * from '@repo/core/logic/managers/community.factory';
export * from '@repo/core/logic/managers/educational.factory';
export * from '@repo/core/logic/managers/featureFlag.factory';
export * from '@repo/core/logic/managers/growth.factory';
export * from '@repo/core/logic/managers/identity.factory';
export * from '@repo/core/logic/managers/media.factory';
export * from '@repo/core/logic/managers/misc.factory';
export * from '@repo/core/logic/managers/notification.factory';
export * from '@repo/core/logic/managers/profile.factory';
