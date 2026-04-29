# 🏛️ sovereign_audit:architecture - @repo/community
> **Timestamp:** 2026-04-28T08:08:12.084Z
> **Target Path:** `packages/community`
> **Audit Score:** 🔴 ACTION REQUIRED

## 📊 Executive Summary
| Metric | Value |
| :--- | :--- |
| **Total Violations** | 60 |
| **Hygiene Warnings** | 1 |
| **Subpath Exports** | 11 subpaths |

## ⚠️ Hygiene Warnings
- Wildcard export in src/index.ts

## ❌ Architectural Violations
| Type | File | Issue | Documentation |
| :--- | :--- | :--- | :--- |
| **NATIVE POLLUTION** | `./hooks/useComposerLogic.ts` | 8:import * as ImagePicker from 'expo-image-picker'; | N/A |
| **NATIVE POLLUTION** | `./components/ManifestoCard.tsx` | 8:import Animated, { LinearTransition } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./components/CommunityHearth.tsx` | 15:import { Platform, useWindowDimensions } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/BaseChatScreen.tsx` | 27:import { FlatList } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/BaseChatScreen.tsx` | 28:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/UserPublicProfileScreen.web.tsx` | 40:import { Platform, ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/UserPublicProfileScreen.tsx` | 29:import { ScrollView } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/DirectMessagesListScreen.tsx` | 16:import Animated, { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/CommunityScreen.tsx` | 29:import { Platform } from 'react-native'; | N/A |
| **NATIVE POLLUTION** | `./screens/GroupsScreen.tsx` | 19:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/GroupDetailsScreen.tsx` | 46:import { FadeInDown } from 'react-native-reanimated'; | N/A |
| **NATIVE POLLUTION** | `./screens/InvitationWelcomeScreen.tsx` | 10:import Animated, { FadeInDown } from 'react-native-reanimated'; | N/A |
| **STATE DENSITY** | `screens/CommunityScreen.web.tsx` | Has 12 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/BaseChatScreen.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/CommunityScreen.tsx` | Has 14 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/AnnouncementsScreen.tsx` | Has 8 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DirectMessagesListScreen.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/DirectMessageScreen.web.tsx` | Has 7 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupChatScreen.web.tsx` | Has 5 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupDetailsScreen.tsx` | Has 11 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `components/HeaderMoreMenu.tsx` | Has 4 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/GroupsScreen.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/UserPublicProfileScreen.web.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/UserPublicProfileScreen.tsx` | Has 6 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **STATE DENSITY** | `screens/InviteCodeEntry.tsx` | Has 3 useState hooks. | [Guide](packages/ui/docs/state-management-guide.md) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/CommunityScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/GroupChatScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **SUBSCRIPTION** | `./screens/DirectMessageScreen.web.tsx` | Missing atomic selector. | [Guide](packages/ui/docs/state-management-guide.md#iii-the-facade-trap) |
| **MEM SINK** | `./components/PinnedResourcesShelf.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/ManifestoCard.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/GroupMemberManagement.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/HeaderMoreMenu.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/HeaderMoreMenu.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./components/CommunityHearth.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/BaseChatScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AnnouncementsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/AnnouncementsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/CommunityScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/DirectMessagesListScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/GroupsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/GroupDetailsScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/UserPublicProfileScreen.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/InviteCodeEntry.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **MEM SINK** | `./screens/UserPublicProfileScreen.web.tsx` | Inline anonymous function in JSX. | [Guide](packages/ui/docs/state-management-guide.md#ii-the-inline-anonymous-sink) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **A11Y** | `./screens/GroupDetailsScreen.tsx` | Component missing accessibilityLabel or alt text. | [Guide](apps/gurudevi-mobile/docs/Core/ui-development-guide.md#accessibility) |
| **SHIM DEBT** | `./components/CommunityHearth.tsx` | Inline Platform.OS branching detected. Use .native.ts / .web.ts shims for logic to ensure isolation. | N/A |
