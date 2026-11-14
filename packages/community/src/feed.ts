/**
 * `@repo/community/feed`
 *
 * Aggregate entry for the community feed surface. Re-exports the feed screens
 * + feed composer hooks so consumers can import only what they need
 * (The server-backed community feed is retired pending its v1 contract.)
 *
 * Platform (.web.tsx) variants of the screens are resolved transitively via
 * the existing per-screen `./screens/*` export conditions — this aggregator
 * itself stays platform-agnostic.
 */

// Components
export { default as PinnedResourcesShelf } from '@repo/community/components/PinnedResourcesShelf';
// Hooks (feed-specific)
// Screens
