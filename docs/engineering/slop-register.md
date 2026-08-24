---
title: "Slop Register — Expo / React Native / Polymath Failure Modes"
status: "active"
created: 2026-08-24
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [anti-slop, expo, react-native, register]
---

# Slop Register — Expo / React Native / Polymath Failure Modes

> This register is the concrete, searchable list of AI-slop failure modes that
> agents (and humans) produce in this repo. It is read at the start of sessions
> (see `AGENTS.md` → Anti-Slop Rules) and pairs with
> [`2026-ai-slop-healing-audit.md`](./2026-ai-slop-healing-audit.md).
>
> **Banned pattern = a specific fix.** When a pattern recurs, it gets added here
> so agents stop producing it.

## A. Rendering & images

| # | Pattern | Fix |
| --- | --- | --- |
| R1 | `react-native` `Image` instead of `expo-image` | Use `expo-image` (`Image` from `@repo/ui` re-export where present) — correct caching, disk-memory policy, fade-in, placeholders. |
| R2 | `FlatList` where a long list needs recycle perf | Use `FlashList` (v2 requires New-Arch; enabled). Bounded row complexity, stable keys. |
| R3 | `0 &&` short-circuit rendering (`items.length && <List/>` renders `0`) | Explicit boolean: `items.length > 0 &&`, or a ternary returning `null`. React Doctor catches this. |
| R4 | Hardcoded hex colors inline | Token from `@repo/ui` `components/motion.ts` `color.*` or theme; `react-native/no-color-literals` is `warn`. |

## B. Motion & animation

| # | Pattern | Fix |
| --- | --- | --- |
| M1 | `useEffect` + `onLayout`/RAF animation hacks | Use `react-native-reanimated` (primary engine), `withTiming/withSpring` with tokens from `motion.ts`. |
| M2 | Hardcoded durations/easing per-file | `duration`/`easing`/`easingPoints`/`scale` from `@repo/ui` `components/motion.ts`. |
| M3 | Animation without reduced-motion path | Gate via `useReduceMotion`/`isReduceMotionEnabled`; swap movement for opacity/color/no-op. |
| M4 | Animation leak in recycled list rows / unmount | Tear down in `useEffect` cleanup; no `withRepeat` without a stop control bound to unmount. |
| M5 | Bare `enter`/`exit` from Reanimated without Reduced-motion | Reuse `screenTransitions` helpers (`softCrossfadeScale`) in Stack options. |

## C. State & data

| # | Pattern | Fix |
| --- | --- | --- |
| D1 | Mutation with no failure path | Every mutation answers: retry? cancellable? idempotent? optimistic? undoable? Happy-path-only is banned (`AGENTS.md` #5). |
| D2 | Fetch/error conventions invented per feature | Use central data layer (request cancellation, timeouts, retry, cache invalidation, dedupe, offline). |
| D3 | Forget optimistic reconcile / undo on failure | Restore prior state + count of retry/undo; never hide a failed mutation. |
| D4 | unparsed server data into UI | Validate at API boundary (schemas close to source); no silent `undefined` cascade. |
| D5 | Discard drafts/intent on background or failure | Persist drafts/recoverable state (local-first store). |

## H. Hermes / New Architecture constraints

| # | Constraint | Notes |
| --- | --- | --- |
| H1 | No `ReadableStream` / full web APIs in Hermes | Guard web-only modules behind platform files (`*.web.tsx`). |
| H2 | `react-native-reanimated` 4 requires `react-native-worklets` | Sacred pin; never add a second animation engine (Moti/Ease) without a measured need (`delight-system-sop.md`). |
| H3 | MMKV reads in render / sync during render | Read MMKV in effects/selectors, not during render; handle absence. |
| H4 | Hardcoded entitlement strings in native | All native config through `app.json` plugins / `plugins/*.js`; never edit `android/`/`ios/`. |

## A. Pattern hygiene

| # | Pattern | Fix |
| --- | --- | --- |
| P1 | Restating comments (`// gets the user` above `getUser()`) | Remove; comment must say what code cannot. |
| P2 | Duplicate helper (variant names) | Search `@repo/core` / `@repo/ui` before adding; `fallow`/`audit:fallow` verifies. |
| P3 | Single-use dead abstraction / wrapper | Inline. |
| P4 | `// TODO` stubs with no work item | Reference an issue, or remove. |
| P5 | `catch` that swallows | Surface a recovery path; `.catch(() => {})` is human-reviewed only. |
| P6 | `as any` / `as unknown as X` escapes | Model the domain (`UserId`, not `string`); types over assertions. |
| P7 | Cognitive complexity > 15 | Extract; sonarjs `complexity` enforces; keep small diffs. |
| P8 | Deep `../../` imports across package boundaries | `@/*` aliases within packages; declared subpath exports across packages (`check:deep-imports`). |

## How to add an entry

1. Add the row with `#`, Pattern, Fix.
2. Hook the recurring pattern into the `AGENTS.md` Slop List (priority rule set).
3. If a tool now detects it, note the overlap verdict in
   `docs/stack-map/landscape/dependency-annotations.yaml` and regenerate.