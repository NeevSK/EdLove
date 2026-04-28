# 🏛️ sovereign_audit:architecture - @repo/community
> **Timestamp:** 2026-04-27T03:10:48.408Z
> **Target Path:** `packages/community`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 79 |
| **Hygiene Warnings** | 1 |
| **Subpath Exports** | 11 subpaths |

## ⚠️ Hygiene Warnings
- Wildcard export in src/index.ts

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **NATIVE POLLUTION** | `./components/CommunityPresence.tsx` | 17:} from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/CommunityHearth.tsx` | 5:import { Platform, useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/CommentSheet.tsx` | 5:import { Alert } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/PostCard.tsx` | 17:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./components/ManifestoCard.tsx` | 5:import Animated, { LinearTransition } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./hooks/useComposerLogic.ts` | 2:import * as ImagePicker from 'expo-image-picker'; | N/A |
| **NATIVE POLLUTION** | `./screens/GroupDetailsScreen.tsx` | 32:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/DirectMessagesListScreen.tsx` | 24:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/DirectMessagesListScreen.tsx` | 28:import Animated from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/UserPublicProfileScreen.web.tsx` | 40:import { Platform, ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/GroupsScreen.tsx` | 20:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/InvitationWelcomeScreen.tsx` | 16:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/InvitationWelcomeScreen.tsx` | 21:import Animated from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/BaseChatScreen.tsx` | 27:import { FlatList } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/BaseChatScreen.tsx` | 28:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/UserPublicProfileScreen.tsx` | 36:import { ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/CommunityScreen.tsx` | 35:import { Platform } from 'react-native'; | N/A |
| **STATE DENSITY** | `screens/AnnouncementsScreen.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/BaseChatScreen.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/CommunityScreen.tsx` | Has 15 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DirectMessageScreen.web.tsx` | Has 7 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupChatScreen.web.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/CommunityScreen.web.tsx` | Has 12 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DirectMessagesListScreen.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useCommunityPresence.ts` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupDetailsScreen.tsx` | Has 11 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupsScreen.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `hooks/useCommunityProfile.ts` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/HeaderMoreMenu.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/GroupMemberManagement.tsx` | Has 7 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/InviteCodeEntry.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/UserPublicProfileScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/SocialShieldModal.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/UserPublicProfileScreen.web.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./hooks/useSocialShield.ts` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **MEM SINK** | `./components/CommunityHearth.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/SocialShieldModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/SocialShieldModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/SocialShieldModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/SocialShieldModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/CreateGroupModal.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/PinnedResourcesShelf.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/HeaderMoreMenu.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/HeaderMoreMenu.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/UserPublicProfileScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ManifestoCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/UserPublicProfileScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/InviteCodeEntry.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/BaseChatScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AnnouncementsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AnnouncementsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/GroupsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/DirectMessagesListScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **SHIM DEBT** | `./components/CommunityHearth.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
