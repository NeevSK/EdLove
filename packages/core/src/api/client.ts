/**
 * Mobile/web-safe API surface.
 *
 * Server handlers and database-backed adapters are intentionally exposed only
 * through `@repo/core/api/server` so client bundles cannot pull them in by
 * importing the default API barrel.
 */
export * from './index';
