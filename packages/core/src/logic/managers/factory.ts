/**
 * Sovereign Domain Factory
 *
 * This module re-exports domain managers from their specialized factories.
 * Transitioning toward a Registry-based Inversion of Control (IoC).
 */

export * from '@/logic/managers/auth.factory';
export * from '@/logic/managers/authz.factory';
export * from '@/logic/managers/community.factory';
export * from '@/logic/managers/educational.factory';
export * from '@/logic/managers/featureFlag.factory';
export * from '@/logic/managers/growth.factory';
export * from '@/logic/managers/identity.factory';
export * from '@/logic/managers/media.factory';
export * from '@/logic/managers/misc.factory';
export * from '@/logic/managers/notification.factory';
export * from '@/logic/managers/profile.factory';
