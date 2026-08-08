/**
 * `@repo/community/feed`
 *
 * Aggregate entry for the community feed surface. Re-exports the feed screens
 * + feed composer hooks so consumers can import only what they need
 * (`import { CommunityScreen, PostCard } from '@repo/community/feed'`).
 *
 * Platform (.web.tsx) variants of the screens are resolved transitively via
 * the existing per-screen `./screens/*` export conditions — this aggregator
 * itself stays platform-agnostic.
 */

// Components
export { default as CreatePostModal } from '@repo/community/components/CreatePostModal';
export { default as PinnedResourcesShelf } from '@repo/community/components/PinnedResourcesShelf';
export { default as PostCard } from '@repo/community/components/PostCard';
// Hooks (feed-specific)
export { useCommunity } from '@repo/community/hooks/useCommunity';
export { useComposerLogic } from '@repo/community/hooks/useComposerLogic';
// Screens
export { default as CommunityScreen } from '@repo/community/screens/CommunityScreen';
export { default as CommunityScreenWeb } from '@repo/community/screens/CommunityScreen.web';
