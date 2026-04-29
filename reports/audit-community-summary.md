# Sovereign Surgical Error Analysis: community
> **Mode:** Local Only Filtering

> **Timestamp:** 2026-04-28 13:37:36
> **Target:** C:\Users\Naween\projects\polymath-platform\packages\community
> **Filtered:** 1 external errors hidden
> **Total Errors:** 20

## Executive Summary

| File Path | Errors | Common Codes |
| :--- | :---: | :--- |
| src/screens/CommunityScreen.web.tsx | 6 | TS2304, TS7006 |
| src/screens/CommunityScreen.tsx | 3 | TS2304, TS2740, TS2345 |
| src/index.ts | 2 | TS2307 |
| src/screens/GroupDetailsScreen.tsx | 2 | TS2307 |
| src/components/PostCard.tsx | 2 | TS2307 |
| src/components/HeaderMoreMenu.tsx | 2 | TS2307 |
| src/components/CommunityPresence.web.tsx | 1 | TS2307 |
| src/screens/UserPublicProfileScreen.tsx | 1 | TS2307 |
| src/screens/GroupsScreen.tsx | 1 | TS2307 |

## Error Distribution

| Code | Count | Description (Heuristic) |
| :--- | :---: | :--- |
| TS2307 | 11 | Cannot find module '../hooks/useSocialShield' or its corr... |
| TS7006 | 4 | Parameter 'post' implicitly has an 'any' type. |
| TS2304 | 3 | Cannot find name 'CreateGroupModal'. |
| TS2740 | 1 | Type '{ isOpen: boolean; onClose: () => void; postId: str... |
| TS2345 | 1 | Argument of type 'string | undefined' is not assignable t... |

## Detailed Findings

### File: src/screens/CommunityScreen.web.tsx
Total errors in file: 6

- [ ] **Line 61, Col 62** | TS2304
  > Cannot find name 'useCommunity'.
- [ ] **Line 85, Col 45** | TS2304
  > Cannot find name 'useCommunityGroups'.
- [ ] **Line 111, Col 8** | TS7006
  > Parameter 'post' implicitly has an 'any' type.
- [ ] **Line 115, Col 26** | TS7006
  > Parameter 'tag' implicitly has an 'any' type.
- [ ] **Line 218, Col 31** | TS7006
  > Parameter 'post' implicitly has an 'any' type.
- [ ] **Line 420, Col 51** | TS7006
  > Parameter 'group' implicitly has an 'any' type.

---
### File: src/screens/CommunityScreen.tsx
Total errors in file: 3

- [ ] **Line 211, Col 18** | TS2345
  > Argument of type 'string | undefined' is not assignable to parameter of type 'RefetchOptions | undefined'.
  > * Type 'string' has no properties in common with type 'RefetchOptions'.
- [ ] **Line 636, Col 10** | TS2304
  > Cannot find name 'CreateGroupModal'.
- [ ] **Line 638, Col 10** | TS2740
  > Type '{ isOpen: boolean; onClose: () => void; postId: string | undefined; targetUserId: string | undefined; targetUserName: string | undefined; }' is missing the following properties from type 'SocialShieldModalProps': reason, target, shouldBlock, step, and 5 more.

---
### File: src/index.ts
Total errors in file: 2

- [ ] **Line 9, Col 46** | TS2307
  > Cannot find module './components/CommunityPresence' or its corresponding type declarations.
- [ ] **Line 17, Col 46** | TS2307
  > Cannot find module './components/SocialShieldModal' or its corresponding type declarations.

---
### File: src/screens/GroupDetailsScreen.tsx
Total errors in file: 2

- [ ] **Line 52, Col 31** | TS2307
  > Cannot find module '../components/SocialShieldModal' or its corresponding type declarations.
- [ ] **Line 53, Col 30** | TS2307
  > Cannot find module '../hooks/useCommunity' or its corresponding type declarations.

---
### File: src/components/PostCard.tsx
Total errors in file: 2

- [ ] **Line 9, Col 30** | TS2307
  > Cannot find module '../hooks/usePollLogic' or its corresponding type declarations.
- [ ] **Line 10, Col 30** | TS2307
  > Cannot find module '../hooks/usePostLogic' or its corresponding type declarations.

---
### File: src/components/HeaderMoreMenu.tsx
Total errors in file: 2

- [ ] **Line 9, Col 33** | TS2307
  > Cannot find module '../hooks/useSocialShield' or its corresponding type declarations.
- [ ] **Line 10, Col 31** | TS2307
  > Cannot find module './SocialShieldModal' or its corresponding type declarations.

---
### File: src/components/CommunityPresence.web.tsx
Total errors in file: 1

- [ ] **Line 10, Col 38** | TS2307
  > Cannot find module '../hooks/useCommunityPresence' or its corresponding type declarations.

---
### File: src/screens/UserPublicProfileScreen.tsx
Total errors in file: 1

- [ ] **Line 31, Col 31** | TS2307
  > Cannot find module '../components/SocialShieldModal' or its corresponding type declarations.

---
### File: src/screens/GroupsScreen.tsx
Total errors in file: 1

- [ ] **Line 21, Col 36** | TS2307
  > Cannot find module '../hooks/useCommunityGroups' or its corresponding type declarations.

---
