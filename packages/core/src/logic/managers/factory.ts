/**
 * Sovereign Domain Factory
 *
 * This module re-exports domain managers from their specialized factories.
 * Transitioning toward a Registry-based Inversion of Control (IoC).
 */

export * from './auth.factory';
export * from './authz.factory';
export * from './community.factory';
export * from './educational.factory';
export * from './featureFlag.factory';
export * from './growth.factory';
export * from './identity.factory';
export * from './media.factory';
export * from './misc.factory';
export * from './notification.factory';
export * from './profile.factory';
