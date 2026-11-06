/**
 * `@repo/community/chat`
 *
 * Aggregate entry for the community chat surface. Re-exports the shared
 * chat screens + composer hooks so consumers can import only what they need
 * (`import { BaseChatScreen, GroupChatScreen } from '@repo/community/chat'`).
 *
 * Platform (.web.tsx) variants of the screens are resolved transitively via
 * the existing per-screen `./screens/*` export conditions — this aggregator
 * itself stays platform-agnostic.
 */

// Components
// Hooks (chat-specific)
export { useCommunityPresence } from '@repo/community/hooks/useCommunityPresence';
export type {
  BaseChatScreenProps,
  SubscriptionConfig,
} from '@repo/community/screens/BaseChatScreen';
// Screens
export { default as BaseChatScreen } from '@repo/community/screens/BaseChatScreen';
