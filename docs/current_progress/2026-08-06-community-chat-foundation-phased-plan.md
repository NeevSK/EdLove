---
title: "Community & Chat Foundation — Phased Implementation Plan"
status: "draft"
created: 2026-08-06
updated: 2026-08-06
author: "opencode"
tags: [phased-plan, community, chat, ai-assistant, legend-list, keyboard-controller]
superseded_by: ""
---

# Community & Chat Foundation — Phased Implementation Plan

## Overview

Harden the two chat surfaces (AI assistant + community group/DM chat) to production grade, and restructure the `@repo/community` package into independently-importable `community/feed` and `community/chat` submodules.

**Strategy:** put the shared foundational infra in place now (list, composer, keyboard layer, streaming-scroll, module split), then develop user-facing functionality in later phases, starting from the highest user-facing impact.

**Current state (audited 2026-08-06):**
- `packages/ai/src/screens/AIAssistantScreen.tsx` — `FlatList` + `scrollToEnd`, `KeyboardAvoidingView`, static "Thinking" footer, plain text bubbles.
- `packages/community/src/screens/BaseChatScreen.tsx` — `FlatList`, optimistic sends + realtime INSERT subscription, `InputField` composer.
- `packages/ui/src/components/SanctuaryFlashList.tsx` — wraps `@shopify/flash-list@2.0.2` (kept for grids/carousels/uniform lists).
- Not yet installed: `@legendapp/list`, `react-native-keyboard-controller`.
- Already installed: `react-native-enriched-markdown@^0.6.0` in `apps/gurudevi-mobile` (unwired).

## Architectural Decision — One Phase or Two?

**Answer: one shared foundation phase, then separate feature phases.** Never one atomic phase containing both AI and community work; never two fully-sequential phases that duplicate the foundation.

| Layer | Owner | Phase |
|---|---|---|
| Keyboard layer, LegendList chat primitives, composer shell, streaming-scroll | `packages/ui` | **2 (foundation)** |
| Community module split (`feed` vs `chat`) | `packages/community` | **2 (foundation)** |
| AI chat hardening (streaming UX, keyboard, bubble boundary) | `packages/ai` | 3 |
| Markdown rendering in bubbles + feed posts | `packages/ui` + consumers | 4 |
| Community chat feature buildout (attachments → typing → reactions → threads) | `community/chat` | 5 |
| Community feed feature buildout | `community/feed` | 6 |

Rationale: the expensive-to-build-once work is the presentational infra shared by both screens. The domain logic diverges sharply (AI = single-thread streaming AG-UI ndjson + privacy/billing modes; community = multi-user Supabase realtime + optimistic sends + identity). Coupling them in one phase yields two unrelated test surfaces and no clean merge point; sequencing them without a shared foundation forces duplicated work.

## Target Module Architecture

`@repo/community` gains two group entry points so consumers import only what they need:

```
@repo/community/feed   → feed screens (CommunityScreen), PostCard, CreatePostModal,
                         PinnedResourcesShelf, hooks (useCommunity, useComposerLogic)
@repo/community/chat   → BaseChatScreen + SubscriptionConfig, GroupChatScreen,
                         DirectMessageScreen, DirectMessagesListScreen, HeaderMoreMenu,
                         chat hooks
```

- `package.json` `exports` maps add `"./chat"` and `"./feed"` (types + import + default), **alongside** the existing per-screen subpaths — no existing import breaks.
- `packages/community/src/index.ts` keeps the `BaseChatScreen` / `SubscriptionConfig` re-exports; `apps/gurudevi-mobile/src/screens/index.ts:27` untouched.
- This phase is **structural** (export/entry plumbing). Deeper physical code separation happens as feed/chat features are built in Phases 5–6.

## Phase 2 — Foundational Infra (THIS PHASE)

### 2.1 Dependencies (per AGENTS.md native-dep protocol)
- `@legendapp/list@3.3.3` → `packages/ui` (peer + dev) + `apps/gurudevi-mobile` (dependency). 100% JS, no native dep, works in Expo Go.
- `react-native-keyboard-controller@1.21.9` (SDK-57-compatible, chosen by `expo install`) → `packages/ui` (peer + dev) + `apps/gurudevi-mobile` (dependency).
  - **No config plugin ships in 1.21.9** (verified: no `plugin` field, no `app.plugin.js`). Wired instead via `android.softwareKeyboardLayoutMode: "resize"` in `app.json` + non-destructive `npx expo prebuild --no-install --platform android` (verified `adjustResize` in generated `AndroidManifest.xml`).
  - **Bonus finding:** 1.21.9 ships `KeyboardChatScrollView` (`keyboardLiftBehavior` `'always' | 'whenAtEnd' | 'persistent' | 'never'` = Telegram/ChatGPT/Claude/Perplexity modes; `extraContentPadding` for growing composer; `blankSpace` = the AI streaming-reply anchor; composes with virtualized lists via `ScrollViewComponent`). This replaces the manual `KeyboardStickyView` + LegendList `anchoredEndSpace` combo planned below — see 2.2.
- **Never** `expo install --fix`; do not touch the `expo.install.exclude` / `doctor.reactNativeDirectoryCheck.exclude` arrays or the sacred versions.

### 2.2 Shared UI foundation (`packages/ui`)  — COMPLETE (2026-08-06)
> **Architectural decision (spike outcome):** rather than each screen re-implementing inverted-list `scrollToEnd` + `KeyboardAvoidingView` effects, the foundation introduces a **`ChatProvider` coordination layer** (`src/context/ChatContext.tsx`) that owns every mutable scroll primitive and exposes only stable callbacks. Screens call `scrollToIndex` / `syncComposerHeight` and read `eventId`. Mutating values are contained in the provider (via a stable `stateRef`) to satisfy the repo's `react-hooks/immutability` (React Compiler) rule.
> - **List:** `src/components/SanctuaryLegendList.tsx` (+ `.web.tsx`). Native branch renders `@legendapp/list/keyboard`'s `KeyboardAwareLegendList` when a `keyboardLiftBehavior` is supplied (composes `KeyboardChatScrollView` + `anchoredEndSpace`/`contentInsetEndAdjustment` natively); otherwise a plain `LegendList`. Web branch renders the `@legendapp/list/react-native` DOM build (browser condition) and accepts the same props, ignoring the keyboard ones. Defaults: `initialScrollAtEnd`, `maintainScrollAtEnd`, `RefreshControl`, empty-state → `EmptyState`. Wires `listRef` registration + `scrollToIndex({index})` reaction on `chat.eventId` to the provider.
> - **Keyboard layer:** `src/components/SanctuaryChatScrollView.tsx` wraps `KeyboardChatScrollView` (default lift `'always'`, re-exports `KeyboardChatScrollViewProps`, forwards the Reanimated `ScrollView` ref).
> - **Composer:** `src/components/ChatComposer.tsx` — grow/shrink multiline `InputField` (`minHeight=44`, `maxHeight=140`, `maxLength=500`) whose `onLayout` reports its height to the chat list via `chat.syncComposerHeight(height)` (updates `contentInsetEndAdjustment` SV + `reportContentInset` as appropriate). Optional attachment slot (default `Image` icon) and `Send` w/ spinner.
> - **Bubble:** `src/components/MessageBubble.tsx` — `React.memo` plain-text bubble, variants `user | assistant | group`, `isOwn` for group alignment, author/timestamp/avatar props. Markdown deferred to Phase 4.
> - Exported through the UI barrel files (`src/components/index.ts`, `src/context/index.ts`) and via `package.json` `exports` entries `./components/ChatComposer`, `./components/MessageBubble`, `./components/SanctuaryChatScrollView`, `./components/SanctuaryLegendList` (with `browser`→`.web.tsx` condition), and `./context/ChatContext`.
> - **Verification:** `packages/ui` typecheck EXIT 0. New files pass ESLint with **0 errors** (warnings only: `forwardRef`/React-19/useContext/`as any`, all pre-existing repo-tolerated categories). Note: `packages/ui` ESLint is pre-existingly red at ~522 errors across the monorepo (e.g. `SanctuaryBackground`, `SanctuaryToast`, `context/index.ts` `import-x/export` duplicate re-exports, `sonarjs/cognitive-complexity`) — **not introduced by this phase**. The `lint:biome` scoped script also errors pre-existingly (`scoped-biome.mjs` resolves repo-relative paths from `packages/ui`, causing IO errors on chunk 1); biome was run directly on the touched files instead.

### 2.3 Community module split (`packages/community`)
- Group exports into `chat` and `feed`; add `./chat` / `./feed` export maps; keep all existing subpaths and the `BaseChatScreen`/`SubscriptionConfig` re-exports.

### 2.4 Migrate AI assistant to foundation (user-facing first)  — COMPLETE (2026-08-06)
- `AIAssistantScreen.tsx`: `FlatList` → `SanctuaryLegendList` (`keyboardLiftBehavior="whenAtEnd"` for ChatGPT feel, `initialScrollAtEnd` + `maintainScrollAtEnd` to auto-pin to new messages — replaces the manual `scrollToEnd` `useEffect`); `KeyboardAvoidingView` + inline `TextInput`/`Send` → `ChatComposer` (drives `contentInsetEndAdjustment` via `ChatProvider`); `SanctuaryChatScrollView` keyboard-lift handled by the list.
- **Kept intact:** header pills (billing/privacy mode selectors), back button, login prompt, gradient `Animated` message bubble (`FadeInUp`/`Layout`), `useAIAgent` streaming logic, `privacyMode`/`billingMode` state. Fixed a pre-existing `no-floating-promises` on `setBillingMode`/`setPrivacyMode` to match the web screen's `void` convention.
- **Deferred to Phase 3:** swap the gradient `Animated` bubble for the shared `MessageBubble` + streaming "Thinking" shimmer; wire `scrollToIndex` for the placeholder anchor. `MessageBubble` is available now (used by Phase 5 community chat); AI integration waits on animation support to avoid regressing the existing bubble UX.
- `AIAssistantScreen.web.tsx` **left as-is** — it is a deliberate CSS/`<textarea>` implementation (active-gaps sidebar, two-column, clear-history) not isomorphic to the RN chat list; web parity via `SanctuaryLegendList.web` is a separate follow-up. `packages/ai` typecheck 0 errors; ESLint 0 problems on the screen.

### 2.5 Migrate community chat to foundation
- `BaseChatScreen.tsx`: same list/composer/keyboard swap. Keep realtime INSERT subscription, optimistic sends, `useSafeMutation`, `isReadOnly` historical-view guard.

### 2.6 Verification
- Typecheck: `packages/ui`, `packages/community`, `packages/ai`, `apps/gurudevi-mobile`.
- Biome format + lint; vitest suites (sanctuary-api unaffected).
- Device smoke test (Android) + web.

## Phase 3 — AI Chat Hardening Polish
- Streaming placeholder + shimmer "Thinking" label (Skia is already a sacred dep), scroll-anchor behavior verification, tool/reasoning trace surface (optional, mirrors margelo `ReasoningSheet`).
- Verify `initialScrollAtEnd` / `anchoredEndSpace` behavior on a physical device.

## Phase 4 — Markdown Rendering
- Wire `react-native-enriched-markdown@^0.6.0` (already a dep) into `MessageBubble` (AI + community) and feed post bodies.
- Streaming-safe markdown render for AI replies.

## Phase 5 — Community Chat Feature Buildout (in `community/chat`, user-facing order)
1. **Image attachments** in chat composer — reuse `expo-image-picker` + `uploadToCloudinary` pattern from `useComposerLogic`.
2. **Typing indicators** — Supabase presence / realtime.
3. **Message reactions** — `reactions` table + RLS + UI.
4. **Threads / reply chains** — `parent_id` on messages + thread view.

## Phase 6 — Community Feed Feature Buildout (in `community/feed`)
- Feed interactions, shelving, and remaining user-facing feed functionality as defined by product priorities.

## Guardrails
- Never edit `android/` / `ios/` directly; native config only via `app.json` + `plugins/`.
- Preserve `BaseChatScreen` / `SubscriptionConfig` re-exports (guardrail).
- Commit `pnpm-lock.yaml`; never `expo install --fix`; never change sacred versions.
- No `.env` secrets; keep web `.web.tsx` variants in sync.

## Open Questions
- Exact `@legendapp/list` version to pin (3.3.x line; confirm latest compatible with Expo 57). Resolved: 3.3.3 pinned in `packages/ui` + `apps/gurudevi-mobile`.
- **Web strategy for `SanctuaryLegendList` — RESOLVED during 2.2 spike:** `@legendapp/list/react-native` ships a `browser` condition resolving to a DOM build; `SanctuaryLegendList.web.tsx` renders it directly. Keyboard-aware props are accepted and ignored on web.
- Threads may warrant their own sub-phase if scope grows; revisit at 5.4 kickoff.
- Composer component naming: named `ChatComposer` (not `Composer` to avoid colliding with the existing `ContentComposer`).
