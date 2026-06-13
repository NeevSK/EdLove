# Navigation Shell Audit

This note is a file-level audit of the current Expo Router migration surface, focused on why the app can still feel "not quite mobile" on native and "not quite web" in the browser.

## Short answer

There is a web-specific header, but it is not the only header in play.

- [`packages/ui/src/components/WebScreenHeader.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/WebScreenHeader.web.tsx) exists and is used on several web-only screens.
- The bigger issue is that many screens still use the shared [`GlobalHeader`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.tsx), which blends mobile and web behaviors into one chrome layer.

The updated chrome doctrine now lives here:
- [`apps/gurudevi-mobile/docs/Core/navigation-chrome-doctrine.md`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/docs/Core/navigation-chrome-doctrine.md)

## Why mobile still feels off

### 1. The main mobile tab shell is still a dashboard shell, not a native navigation shell

The main entry point is [`apps/gurudevi-mobile/app/(tabs)/_layout.tsx`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/(tabs)/_layout.tsx).

Likely effect:
- Every tab gets a large shared header
- Search, notifications, and role chrome live at the same layer as navigation
- The experience feels like a workspace dashboard with tabs, not a native mobile app with focused tab content

### 2. The shared header is doing too much on mobile

[`packages/ui/src/components/GlobalHeader.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.tsx) was a major suspect before the split.

What it currently combines:
- back button or drawer button
- title and subtitle
- role-aware identity display
- search affordance
- notification bell and drawer
- profile entry point
- web-aware styling behavior

Why that mattered:
- Native mobile screens usually need lighter chrome
- A dense top bar makes the app feel like a control panel rather than a phone-first experience
- Shared header logic makes it easy for native screens to inherit web-ish patterns

### 3. Many mobile screens still rely on the same app shell primitives as web-like screens

Files that are likely contributing:
- [`packages/profile/src/screens/ProfileScreen.tsx`](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/ProfileScreen.tsx)
- [`packages/community/src/screens/CommunityScreen.tsx`](C:/Users/Naween/projects/polymath-platform/packages/community/src/screens/CommunityScreen.tsx)
- [`packages/library/src/screens/LibraryScreen.tsx`](C:/Users/Naween/projects/polymath-platform/packages/library/src/screens/LibraryScreen.tsx)
- [`packages/admin/src/screens/FounderDashboard.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/FounderDashboard.tsx)
- [`packages/admin/src/screens/GuardianDashboard.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/GuardianDashboard.tsx)
- [`packages/admin/src/screens/PrincipalDashboard.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/PrincipalDashboard.tsx)

Pattern to watch:
- `ScreenWrapper`
- `GlobalHeader`
- broad scroll containers
- lots of top-level cross-surface actions

That is a good app shell pattern, but it can flatten into a web dashboard feel if used everywhere.

### 4. The root app shell is intentionally heavy

[`apps/gurudevi-mobile/app/_layout.tsx`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/_layout.tsx) includes:
- auth/bootstrap logic
- splash handling
- biometrics / PIN lock
- push bootstrap
- route guards
- global banners and toasts
- app-wide stack config

That is correct architecturally, but it can make startup feel less like a native app session and more like a web bootstrap pipeline.

## Why web still feels off

### 1. The web shell is still app-shell first, browser-first second

The web tabs layout is [`apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx).

Likely effect:
- left navigation rail
- content canvas to the right
- large branded shell chrome
- document title management, but little browser-page affordance

This is coherent for a dashboard, but it can still feel like "the mobile app stretched wider" rather than a web app with clear page hierarchy.

### 2. Web screens are now split between `WebScreenHeader` and the web-specific `GlobalHeader.web`

Good web-first examples:
- [`packages/community/src/screens/CommunityScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/community/src/screens/CommunityScreen.web.tsx)
- [`packages/self/src/screens/SelfScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/self/src/screens/SelfScreen.web.tsx)
- [`packages/library/src/screens/LibraryScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/library/src/screens/LibraryScreen.web.tsx)
- [`packages/admin/src/screens/PrincipalDashboard.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/PrincipalDashboard.web.tsx)
- [`packages/admin/src/screens/principal/DashboardContent.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/principal/DashboardContent.tsx)

Mixed or suspicious web cases:
- [`packages/library/src/screens/PDFViewerScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/library/src/screens/PDFViewerScreen.web.tsx)
- [`packages/library/src/screens/MapScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/library/src/screens/MapScreen.web.tsx)
- [`packages/community/src/screens/UserPublicProfileScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/community/src/screens/UserPublicProfileScreen.web.tsx)
- [`packages/profile/src/screens/FullProfileScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/profile/src/screens/FullProfileScreen.web.tsx)

If a web screen still resolves `GlobalHeader`, it now uses [`packages/ui/src/components/GlobalHeader.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.web.tsx), so the browser-specific chrome lives in the right file instead of leaking into the mobile implementation.

### 3. `ScreenWrapper.web.tsx` is still a full-viewport app wrapper

[`packages/ui/src/components/ScreenWrapper.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/ScreenWrapper.web.tsx) intentionally preserves app-like behavior.

That is useful for consistency, but browser-native expectations are different:
- clearer page boundaries
- lighter chrome for public or document-like surfaces
- fewer "everything is one screen" layouts
- more explicit page titles and section navigation

### 4. Several web screens still use the same dense content structure as native

Files to watch:
- [`packages/community/src/screens/GroupChatScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/community/src/screens/GroupChatScreen.web.tsx)
- [`packages/community/src/screens/DirectMessageScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/community/src/screens/DirectMessageScreen.web.tsx)
- [`packages/library/src/screens/CollectionDetailScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/library/src/screens/CollectionDetailScreen.web.tsx)
- [`packages/admin/src/screens/DocumentListScreen.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/admin/src/screens/DocumentListScreen.web.tsx)

These can work fine, but if the same screen patterns are reused without web-specific hierarchy, the browser experience still feels like an app port.

## Highest-priority files to inspect next

If we want to keep pushing this in the right order, these are the strongest leverage points:

1. [`packages/ui/src/components/GlobalHeader.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.tsx)
2. [`packages/ui/src/components/GlobalHeader.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/GlobalHeader.web.tsx)
3. [`apps/gurudevi-mobile/app/(tabs)/_layout.tsx`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/(tabs)/_layout.tsx)
4. [`apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx`](C:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/app/(tabs)/_layout.web.tsx)
5. [`packages/ui/src/components/ScreenWrapper.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/ScreenWrapper.tsx)
6. [`packages/ui/src/components/ScreenWrapper.web.tsx`](C:/Users/Naween/projects/polymath-platform/packages/ui/src/components/ScreenWrapper.web.tsx)

## Working hypothesis

- Mobile needs a more native-feeling shell separation, with less shared chrome and fewer desktop/dashboard affordances at the top level.
- Web needs clearer page orientation and more web-specific header/page treatment, not just a wider version of the mobile shell.

## Recommended next pass

The most productive follow-up is probably a targeted split:
- create a lighter native header path for mobile tabs and detail screens
- reserve `WebScreenHeader` and web page chrome for web-specific screens
- remove any remaining accidental `GlobalHeader` usage from web routes that should be browser-first
- audit `ScreenWrapper` usage so native screens do not inherit web shell assumptions
