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
export { default as HeaderMoreMenu } from '@repo/community/components/HeaderMoreMenu';
// Hooks (chat-specific)
export { useCommunityGroups } from '@repo/community/hooks/useCommunityGroups';
export { useCommunityPresence } from '@repo/community/hooks/useCommunityPresence';
export { useSocialShield } from '@repo/community/hooks/useSocialShield';
export type {
  BaseChatScreenProps,
  SubscriptionConfig,
} from '@repo/community/screens/BaseChatScreen';
// Screens
export { default as BaseChatScreen } from '@repo/community/screens/BaseChatScreen';
export { default as DirectMessageScreen } from '@repo/community/screens/DirectMessageScreen';
export { default as DirectMessagesListScreen } from '@repo/community/screens/DirectMessagesListScreen';
export { default as GroupChatScreen } from '@repo/community/screens/GroupChatScreen';
