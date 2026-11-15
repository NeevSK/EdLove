---
title: "Gurudevi app shell: tabs, header and FAB"
status: "active"
created: 2026-10-26
updated: 2026-11-15
author: "Neev"
scribe: "Claude"
tags: [gurudevi-mobile, shell, tabs, header, fab]
source: "https://claude.ai/artifact/Jz28DGj9tNBtBEzaqK5Hcn"
---

> **Copied into the repo on 2026-11-15** from the claude.ai page https://claude.ai/artifact/Jz28DGj9tNBtBEzaqK5Hcn so the context lives with the code. The page may keep changing; this file is the version of 15 Nov 2026. The A/B of custom tabs and NativeTabs was built on 2026-10-26; the shell designs page is `prototypes/2026-11-11-shell-designs.html`.

# Gurudevi app shell: tabs, header and FAB

2026-10-26 · @Neev

## Summary

The shell has grown by adding a layer at a time, and it now gives people about nine ways to get somewhere from any screen. The five tabs are sound. What needs work is everything layered on top of them.

- **Too many ways in.** Around every screen sit 5 tabs, a header that changes shape, a strip of sub-tabs, a long-press catalog sheet, a perspective pill, a bell, a settings button, an editorial button and a FAB.

- **The FAB is mostly invisible, but it still costs.** It shows only on the Community and Library home screens. Its pulsing animations run forever even when it is hidden, and verger cannot turn them down.

- **The header has four styles and two different components.** Its buttons are written twice, and the header switches shape between a tab's home screen and the screens below it.

- **Auto-hide removes the tab bar.** It can leave the tab bar hidden after you move to a screen that never shows it again.

- **Routes are duplicated.** Settings has 3 routes, and attendance, gradebook and atlas each have 2. Developer labs sit in the production route tree.

- **The tab layout file is 769 lines.** It also loads data, saves to the database and owns four modals.

The proposal moves the shell onto the native pieces that became stable in Expo SDK 58, which the app already runs:

- **Tabs:** `NativeTabs` for the tab bar.

- **Headers:** a native header with buttons declared by each screen.

- **Main action:** a floating action above the tab bar that changes with the tab.

All three take the world's colours, fonts and motion, and verger governs anything that moves. The duplicate routes go, and the proposal adds no features.

## How the shell works today

Everything is wired in `app/(tabs)/_layout.tsx` (769 lines), with the FAB mounted separately in `src/entry/EntryShell.tsx`.

| Piece                     | What it is today                                                                                                                                                                                              | Where                                                             |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| Bottom tabs               | Library, Workspace, **Self** (centre, opens first, filled heart), Community, Profile. Long-pressing a tab opens a feature catalog sheet. Notifications and Settings are hidden tab routes                     | `(tabs)/_layout.tsx`                                              |
| Header                    | Four styles chosen in Settings: adaptive (the default), compact_domain, classic_global, minimal_tabs_only. Adaptive shows `GlobalHeader` on a tab's home screen and `DomainSubHeader` on the screens below it | `GlobalHeader.tsx` (416 lines), `DomainSubHeader.tsx` (242 lines) |
| Header buttons            | Editorial (Workspace only), notifications bell with badge, settings. Written once for `GlobalHeader` and again inside `DomainSubHeader`                                                                       | `(tabs)/_layout.tsx`, `DomainSubHeader.tsx`                       |
| Perspective pill          | Workspace only. Opens the perspective switcher, which leads to the invite code, tuition batch and link ward modals                                                                                            | `PerspectiveSwitcherSheet`                                        |
| Sub-tab strip             | Recently opened features in each domain, up to 5, saved across launches                                                                                                                                       | `ActiveSubTabStrip.tsx` (330 lines), `useActiveSubTabsStore`      |
| Auto-hide                 | On by default. Scrolling down hides the header and the tab bar. Only Self and Community report their scrolling                                                                                                | `useScrollChromeCollapser`                                        |
| FAB                       | `LotusPetalFAB` (454 lines), a draggable lotus. Screens register their actions through `FABContext`. It shows only when the screen's registered tab matches the path                                          | `LotusPetalFAB.tsx`, `FABContext.tsx`, `EntryShell.tsx`           |
| Modals owned by the shell | Breathing reset, achievement unlock, school invite code, tuition batch, link ward                                                                                                                             | `(tabs)/_layout.tsx`                                              |

Routes: 56 screens live under the 5 tabs, 19 at the root of the app, and 6 in the modal, auth and public-form groups.

## History

The five tabs have stayed the same since February 2026. Since the move to Expo Router in June, every change has added another layer on top of them. The history before February is not in this clone, which is a shallow one.

| When       | What changed                                                                                                                              |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| 2026-10-22 | Tab bar, headers and Settings take the world's colours                                                                                    |
| 2026-09-12 | Four header styles, `DomainSubHeader`, the sub-tab strip, the long-press catalog sheet and auto-hide added in one WIP commit              |
| 2026-09-08 | Perspectives arrive: the pill, the switcher and the invite, batch and ward modals, all wired into the tab layout                          |
| 2026-08-24 | The archived React Navigation folder is removed                                                                                           |
| 2026-06-09 | `TabNavigator` archived and the app moves to Expo Router. Classroom becomes Workspace. The visible day-phase backdrop is lost in the move |
| 2026-04-29 | A sixth tab, Workforce, appears for a time                                                                                                |
| 2026-03-25 | Screens start registering their FAB actions through context                                                                               |
| 2026-03-13 | `FABContext` added                                                                                                                        |
| 2026-03-08 | The web adds Notifications and Settings panels beside the tabs                                                                            |
| 2026-02-05 | `GlobalHeader` created                                                                                                                    |
| 2026-02-04 | `TabNavigator` with Self, Classroom, Library, Community and Profile, plus `LotusPetalFAB`                                                 |

`TabNavigator` had 88 commits, `GlobalHeader` 56, `LotusPetalFAB` 60 and `FABContext` 16. Most of the 2026-09 shell work came in commits named "wip" or "checkpoint", so there is no design note explaining it.

## Problems found

Each problem is something I read in the code. Items marked *untested* still need checking on a phone.

| \#  | Problem                                             | Evidence                                                                                                                                                                                                                                      | Effect                                                                                               |
|-----|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1   | The FAB rarely shows                                | `getCurrentFabTab` matches `/(tabs)/workspace` or an exact `/community`, but Expo Router paths drop the `(tabs)` group. Workspace, the admin dashboards and screens deeper in a tab therefore get no FAB, even though 10 screens register one | Teachers never see their quick action                                                                |
| 2   | Hidden FAB animations never stop                    | The 4-second pulsing loops start before the visibility check and repeat forever. Only the OS reduce-motion setting stops them, not verger                                                                                                     | Constant UI-thread work on the A52, invisible to verger                                              |
| 3   | The FAB ignores the world                           | Hard-coded `#F6BF8C`, emoji icons (🪷 ➕ 💬) and its own 4 s breathing                                                                                                                                                                        | Looks out of place in every world but Sanctuary                                                      |
| 4   | Two headers, four styles                            | Adaptive switches between `GlobalHeader` and `DomainSubHeader`. The bell, settings and back logic are written twice. Three of the four styles are a Settings choice few people will touch                                                     | The header changes shape as you go deeper, and each fix has to be made twice                         |
| 5   | Auto-hide can leave the tab bar hidden (*untested*) | Hiding sets the tab bar to `display: 'none'` in a global store. Only Self and Community bring it back, and leaving a screen does not reset it                                                                                                 | Someone can lose the tabs after switching screens                                                    |
| 6   | Auto-hide relayouts the screen                      | It toggles `headerShown` rather than sliding the header away                                                                                                                                                                                  | The whole screen shifts while scrolling, a jank risk on low-end phones                               |
| 7   | Too many ways in                                    | 9 kinds of control around each screen. The catalog sheet only opens on a long-press, which nothing on screen tells you about                                                                                                                  | Hard to learn, and harder still for first-time phone users                                           |
| 8   | Duplicate routes                                    | Settings at `/settings`, `/profile/settings` and `/(modal)/app-settings`. Attendance, gradebook and atlas each exist at the root and in Workspace. AI assistant exists at `/a-i-assistant` and `/self/ai-assistant`                           | Back buttons behave differently depending on the way in, and there are two places to fix each screen |
| 9   | Developer screens in the production tree            | `icon-lab`, `ui-showcase`, `verger-lab`, `tutii-dance-preview`                                                                                                                                                                                | Reachable by deep link in a release build                                                            |
| 10  | The shell does business work                        | The tab layout loads repositories, writes to Supabase and owns 5 modals                                                                                                                                                                       | Any change to these reruns the whole shell, and the file is hard to change safely                    |
| 11  | Stack lists have drifted                            | The Workspace stack does not list `atlas` or `commercial/[batchId]`, though both files exist                                                                                                                                                  | Harmless today, but the lists can't be trusted                                                       |

**Correction (two items I raised earlier are not breaks).** I checked Expo Router 58.0.26 itself. It still reads `initialRouteName`, with a deprecation warning, so the app does open on Self. Screens left out of a stack are still mapped, so atlas and tuition batches do push. I switched to `anchor: 'self'` and declared both screens anyway, so the warning goes and the stack is complete.

## What Expo SDK 56–58 and RN 0.88 give us

The app is already on Expo SDK 58, Expo Router 58 and React Native 0.88, but the shell uses none of the new navigation parts. Since SDK 58, native tabs and toolbars are stable ([SDK 58 changelog](https://expo.dev/changelog/sdk-58)).

| Feature                                                                                                         | Since                                                        | What it gives us                                                                                                                                                                                                               | Limits                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `NativeTabs` from `expo-router/native-tabs`                                                                     | Stable in SDK 58 (unstable from 54)                          | The system tab bar, drawn natively. On Android it is the Material bar. Fast on the A52, with no JavaScript tab bar to render                                                                                                   | At most 5 tabs on Android (we have 5). Can't be heavily customised. Tabs can't change while the app runs |
| `NativeTabs.Trigger.Badge`                                                                                      | 56+                                                          | A native badge on a tab, for example unread messages on Community                                                                                                                                                              | none found                                                                                               |
| `NativeTabs.BottomAccessory`                                                                                    | 58, iOS 26 only (per the installed types), so not on Android | A floating view above the tab bar. Its content can change with the tab                                                                                                                                                         | The tab bar's height can't be measured yet                                                               |
| `iconColor`, `indicatorColor`, `rippleColor`, `backgroundColor`, `labelStyle.fontFamily`, `labelVisibilityMode` | 56+ (some Android only)                                      | Tab bar colours and labels in the world's lamp, ink and fonts. Icons can differ between selected and not selected                                                                                                              | iOS 26 draws its own glass background                                                                    |
| `hidden` on `NativeTabs`                                                                                        | 56+                                                          | Hide the tab bar natively when it really has to go, for example in full-screen reading                                                                                                                                         | `minimizeBehavior` on scroll is iOS 26 only                                                              |
| `Stack.Toolbar` with `placement` left, right or bottom                                                          | Android from SDK 56, iOS from 55                             | Header buttons declared per screen, so each tab and screen brings its own buttons. `Badge` for the bell. `Stack.Toolbar.View` holds our own views, such as the perspective pill. Bottom placement suits a screen's main action | Android drops label text. No nesting. Badges only in the header                                          |
| `activityEnabled` (replaces `freezeOnBlur`)                                                                     | 58                                                           | Tabs hide inactive screens but keep their state, which saves memory and work on low-end phones                                                                                                                                 | none found                                                                                               |
| React transitions and preloading                                                                                | 58                                                           | The current screen stays visible while the next one loads                                                                                                                                                                      | Only preloads by default                                                                                 |
| `fontVariationSettings`                                                                                         | RN 0.88                                                      | World fonts with live axes on our own header and FAB text                                                                                                                                                                      | Native tab labels and header titles take `fontFamily` only, not axes                                     |
| `backgroundSize`, `backgroundPosition`, `backgroundRepeat`                                                      | Stable in RN 0.88                                            | Ornament bands and textures as cheap background images, with no extra views                                                                                                                                                    | none found                                                                                               |

RN 0.88 itself adds nothing specific to tab bars, headers or floating buttons ([release notes](https://reactnative.dev/blog/2026/10/19/react-native-0.88)). Its value here is the variable fonts and stable background props.

## Proposed shell

Move to the native pieces Expo now provides, and let the world and the tab decide what each one shows. Keep the five tabs, with Self in the centre and opening first. Everything below is declared per tab, so it changes with the tab, and draws its colours, fonts and motion from the world. Verger governs anything that moves.

| Piece                      | Proposed                                                                                                                                                                                                                                                                                     | How it follows the tab                                                                                                  | How it follows the world                                                                                                                                                          | Fixes                    |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|
| Tab bar                    | `NativeTabs` with the same five tabs. Native badges for unread messages and notifications. `activityEnabled` so hidden tabs stop drawing                                                                                                                                                     | Each tab declares its own icon (selected and not selected), label and badge                                             | `iconColor`, `indicatorColor`, `rippleColor`, `backgroundColor` and `labelStyle.fontFamily` come from the world's tokens and faces, and change when the world or the hour changes | 7, plus speed on the A52 |
| Tab home header            | Not a chrome bar. The top of each tab's home screen is part of the world scene: greeting, ornament band and the perspective pill in Workspace. It scrolls with the content ("Home opens on the sky")                                                                                         | Each tab's home screen draws its own                                                                                    | Full world type with variable axes, ornament and backdrop                                                                                                                         | 4, 5, 6                  |
| Screen header (below home) | The native Stack header, with `Stack.Toolbar` buttons declared by each screen. It replaces `GlobalHeader`, `DomainSubHeader` and the four header styles. Native back and Android predictive back                                                                                             | Each screen lists its own buttons: bell with `Badge`, search, share, or a perspective pill through `Stack.Toolbar.View` | Header background, ink and title font from the world                                                                                                                              | 4                        |
| Main action (FAB)          | `NativeTabs.BottomAccessory`: one floating action above the tab bar, chosen by the active tab and screen. For example, new reflection in Self, take attendance in Workspace, add a resource in Library, new post in Community. A screen's own main action can use the bottom `Stack.Toolbar` | A small map from route segment to action, filled by screens. It replaces string matching on the path                    | The world's lamp and corner shape. It enters with the world's motion and stops animating when hidden or when verger lowers motion                                                 | 1, 2, 3                  |
| Catalog and recent         | An "All tools" button and a "Recent" row on each tab's home screen. Long-press on a tab stays as a shortcut                                                                                                                                                                                  | Per tab                                                                                                                 | World surfaces                                                                                                                                                                    | 7                        |
| Settings                   | Moves into Profile. The header keeps only what the screen needs                                                                                                                                                                                                                              | n/a                                                                                                                     | n/a                                                                                                                                                                               | 4, 8                     |
| Routes                     | One route for each screen, with redirects for old links. Developer labs move to a `(dev)` group left out of release builds. Every screen is declared in its stack, and `anchor: 'self'` replaces `initialRouteName`                                                                          | n/a                                                                                                                     | n/a                                                                                                                                                                               | 8, 9, 11, 12, 13         |
| Shell code                 | Perspective loading moves into a hook and the modals into `ShellModals`. The tab layout keeps only the tabs                                                                                                                                                                                  | n/a                                                                                                                     | n/a                                                                                                                                                                               | 10                       |

**What we give up.** Native tabs can't take the custom filled-heart Self icon in a circle. It becomes a selected and unselected icon pair. The tab bar can't hide itself on scroll on Android. Both are small losses for a faster, steadier shell on low-end phones.

**Correction on the FAB.** `BottomAccessory` works only on iOS 26, so on Android the main action stays our own world-dressed button above the tab bar, using the per-tab action map. Both A/B variants use that button today.

## A/B test: custom tabs vs native tabs

The custom tabs stay the default (A). The system tabs, `NativeTabs`, are a second shell (B). Both use the same routes, header, overlays and modals, and B takes the world's ground, ink and label font. The only thing B lacks is long-press on a tab for the catalog.

**Which shell a launch gets**, first match wins:

1.  Your choice in the shell lab on this phone

2.  Remote config: `globalThis.__GURUDEVI_SHELL_VARIANT__` set to `'custom'` or `'native'`. Setting `'custom'` is the kill switch

3.  The build: `EXPO_PUBLIC_GURUDEVI_SHELL=native`

4.  A stable split of installs: `EXPO_PUBLIC_GURUDEVI_NATIVE_TABS_PERCENT=30` puts about 30% on B, bucketed by install id (key `gurudevi-shell-tabs-v1`)

5.  Otherwise the custom tabs

**Comparing on one phone.** Open the shell lab (`gurudevi://shell-lab`, or the button at the top of the verger lab, dev builds only). Pick A, use the app for 10 minutes or more, then pick B and do the same. The lab shows A beside B: minutes on screen, share of time verger saw stressed frames, share of time memory was trimmed or low, and tab switch time (mean and slowest, from the press to the first frame of the new tab). It can also share the numbers as JSON or reset them.

**Comparing across installs.** Each launch sends `shell_variant_exposed` (variant, how it was chosen, bucket). Each tab switch sends `shell_tab_switch` (variant, tab, ms). Every 5 minutes of use, `shell_variant_health` sends the same summary the lab shows, plus the phone's capacity class.

**Still to check on the A52 with B:** where the header sits under the status bar, whether screens' bottom padding doubles up above the native bar, and the FAB's height above it.

## Steps and decisions

Each step is one small pull request that can be checked on the A52 before the next one starts. Step 1 only fixes bugs, so it can go first. Step 2 is a measured prototype, and its numbers decide whether steps 5 to 7 use the native parts or the fallback.

1.  Quick fixes with no visible change: `anchor: 'self'`, declare every screen in its stack, and stop the hidden FAB's endless animations

2.  A/B of custom tabs against `NativeTabs` on the A52 (built, see the A/B section): use each for a while, then compare in the shell lab

3.  Routes: one route for each screen with redirects, and developer labs in `(dev)`

4.  Split the shell into a perspectives hook and `ShellModals`

5.  Native screen headers with `Stack.Toolbar` buttons per screen, replacing the two headers and four styles

6.  Tab home headers become part of each home's world scene, with "All tools" and "Recent" there

7.  The per-tab main action map, filled by screens, replacing `FABContext` string matching

Decisions for Neev:

- Move to native tabs, giving up the custom filled-heart Self icon and auto-hiding the tab bar on Android?

- Move Settings into Profile, leaving screen headers with only what each screen needs?

- Drop the four header styles (native header below home, the world scene on each home)?

- Make the main action a floating action above the tab bar (no dragging), one per tab?

- Leave developer labs out of release builds entirely, or keep them behind a hidden switch?
