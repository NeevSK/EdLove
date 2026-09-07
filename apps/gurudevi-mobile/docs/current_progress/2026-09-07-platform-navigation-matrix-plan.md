---
title: "Platform Navigation Matrix — Native Tabs, Web Shell, and Account Transitions"
status: "implementation-in-progress"
created: 2026-09-07
updated: 2026-09-07
author: "Naveen"
scribe: "Codex"
tags: [gurudevi, navigation, native, web, account-lifecycle, accessibility]
---

# Platform Navigation Matrix

## Objective

Keep native tabs and the web sidebar/header/profile footer aligned with one
route authority, and never render prior-account chrome during account changes.

## Contract matrix

| Concern | Native | Web | Code evidence | Device evidence still required |
| --- | --- | --- | --- | --- |
| Primary navigation | Five visible Expo Router tabs: Self, Workspace, Community, Library, Profile | Same five primary destinations in sidebar/topbar | `appNavigation` contract and platform shell route lists | Focus order and tab persistence |
| Utility routes | Notifications and Settings are header actions, not tabs | Editorial, Agent Lab, Notifications, Settings are utility/sidebar controls | Metadata surface contract | Pointer/keyboard interaction |
| Header | Title reflects most-specific active route; notifications/settings actions use absolute routes | Page title, rail toggle, utility actions, and profile control use the same metadata | Route-title/active-route tests | Safe area, back behavior, screen-reader output |
| Footer/profile | No native footer; profile is visible tab | Profile card/footer is account-scoped and routes to `/profile` | Account-scoped shell gate | Avatar/name transition during A → B |
| Account A → B / sign-out | Protected shell withheld until profile matches active session | Same withheld shell, including sidebar/footer | `SessionRouteGate` render contract | Actual device/account switch and sign-out |
| Keyboard/insets | Tab bar hides on keyboard; safe-area-derived tab sizing | Responsive rail/topbar behavior | Source contract only | Native keyboard and gesture/inset walkthrough |

## Implementation phases

1. **Shared route metadata** — Keep visible primary routes and utility routes
   in `appNavigation`; test platform lists against it. Do not add separate
   route declarations for web and native.
2. **Account-scoped shell admission** — completed in code. `SessionRouteGate`
   withholds protected shell content for an account/profile mismatch.
3. **Route-tree navigation contract** — completed in code. Every primary and
   utility destination in `appNavigation` is resolved against the live Expo
   Router default route tree. This catches a deleted or renamed destination
   before either native or web chrome can link to it.
4. **Native shell matrix** — verify tab visibility, hidden notifications/settings,
   header title/actions, keyboard hide behavior, and safe-area sizing.
5. **Web shell matrix** — verify sidebar/topbar destinations, profile footer,
   title specificity, keyboard navigation, and account-transition neutrality.
6. **Physical-device acceptance** — native keyboard, safe areas, deep-link
   re-entry, account A → B, sign-out, and re-sign-in.

## Rules

- Screens never own auth redirects; `SessionRouteGate` does.
- Headers, tabs, and sidebar/footer use absolute paths only.
- Cached entitlements never display another account’s identity or role chrome.
- Browser and device evidence are complementary; unit/render tests are not
  substitutes for keyboard, insets, or accessibility traversal.
