---
title: "Gurudevi Interaction Delight Audit and Layered Implementation Plan"
status: "active"
created: 2026-08-31
updated: 2026-08-31
author: "Naveen"
scribe: "Codex"
tags: [mobile, ui, motion, haptics, audio, gestures, accessibility, performance]
---

# Gurudevi Interaction Delight Audit and Layered Implementation Plan

## Purpose

This document records the audit and implementation approach for making Gurudevi
feel more alive through meaningful animation, haptics, sound, transitions, and
gestures. It follows the mobile documentation SOP and the repository's
interaction contracts. The objective is a coherent interaction language, not a
collection of unrelated effects.

## Scope and evidence

The audit covers `apps/gurudevi-mobile`, `packages/ui`, and the shared domain
packages consumed by the mobile app. The repository was already dirty when this
work began, with broad unrelated edits and new files. Existing changes are
preserved; this document does not treat them as authored by this task.

Independent read-only audit streams were dispatched for motion, tactile/audio
feedback, gestures/navigation, and accessibility/performance. Confirmed
intermediate findings are recorded below; any item not yet confirmed by source
inspection remains a follow-up rather than an assumed defect.

## Current stack

- Expo 57, React Native 0.86.2, React 19.2, and Expo Router.
- `@repo/ui` as the shared design-system and interaction seam.
- NativeWind 5 / Tailwind 4 for static styling and shared theme tokens.
- Reanimated 4 and Worklets for UI-thread animation.
- Gesture Handler 3 for native gestures.
- Skia, SVG, and Lottie for selective visual moments.
- Expo Haptics and Expo Audio for native sensory feedback.
- PowerSync, SQLite, Drizzle, MMKV, Supabase, TanStack Query, Zustand, and
  XState for local-first state and asynchronous boundaries.
- React Native Web through Metro for the web target.

## Shared doctrine and Gurudevi dialect

The shared doctrine belongs in `packages/ui`: semantic states, tokenized motion,
reduced-motion behavior, touch targets, accessibility, and safe fallbacks.

The Gurudevi dialect belongs in app composition: sanctuary calm, Firefly
guidance, vellum/ink/saffron atmosphere, breathing, settling, drifting, and
selective illumination. Operational screens should remain quiet; reflection,
onboarding, and meaningful completion moments may carry more atmosphere.

The interaction thesis is:

1. Motion helps people orient and understand change.
2. Tactile feedback marks meaningful state changes, not every tap.
3. Sensory effects settle quickly and always have a visible, accessible
   equivalent.

## Audit by subdomain

### Motion and animation

Status: foundation present; adoption and contract coverage uneven.

Evidence:

- Motion tokens exist in `packages/ui/src/components/motion.ts`.
- Shared primitives and states exist for `PressableScale`, `Collapse`,
  `BrandPulse`, skeletons, success, error, and empty states.
- Reanimated is used widely across community, classroom, AI, self, library,
  profile, and shared UI surfaces.
- Existing code includes both tokenized motion and screen-local animation
  choices, so the same semantic event may feel different across domains.
- The repository's delight audit identifies missing or historically incomplete
  contracts around press feedback, validation shake, collapse, and motion tests;
  current uncommitted files may have addressed some of these and require final
  source/test verification before further changes.

Risks:

- Repeated ad-hoc timings and spring settings can create inconsistent rhythm.
- A motion primitive can exist without being used by the actual route surface.
- Mocks and web shims can make tests pass without proving native behavior.

Priority:

- P0: verify the public exports and runtime behavior of shared motion
  primitives, including reduced motion and interruption.
- P1: standardize route-level entrance/exit and list/item state changes.
- P1: add focused motion contract tests for mount, update, interrupt, unmount,
  and reduced motion.

### Haptics and audio

Status: haptics foundation present; audio delight layer absent.

Evidence:

- `packages/ui/src/utils/haptics.ts` centralizes semantic native haptic helpers.
- `packages/ui/src/utils/haptics.web.ts` intentionally provides no-op web
  implementations.
- Native Expo Haptics usage is concentrated in a small number of surfaces,
  including breathing and shared/runtime paths.
- Expo Audio is configured in the mobile dependency graph and used by
  `packages/self/src/components/VoiceJournaling.tsx`, but there is no general
  product-level sound feedback service.

Risks:

- Adding sound globally would create noise, accessibility problems, and
  lifecycle complexity.
- Haptics called directly from leaves can drift from user preferences and
  semantic event definitions.
- Audio playback needs interruption, silent-mode, unload, and failure behavior.

Priority:

- P0: define a small semantic feedback vocabulary and preference boundary.
- P1: route all new haptic calls through that vocabulary.
- P2: prototype sound only for breathing/reflection or meaningful milestone
  moments, with an explicit opt-in/quiet path and no-op fallback.

### Gestures and navigation transitions

Status: capable feature surfaces exist; contracts are fragmented.

Confirmed high-value gesture surfaces from the audit stream:

- `packages/ui/src/components/workspace/DraggableCanvasSurface.tsx`
- `packages/ui/src/components/TemporalNavigator.tsx`
- `packages/ui/src/components/visualization/AstroView.tsx`
- `packages/library/src/screens/MapScreen.tsx`
- `packages/classroom/src/components/AttendanceSheet.tsx`
- `packages/self/src/screens/SelfNavigator.tsx`

The repository standard requires UI-thread gesture updates, explicit cancel and
release behavior, accessible alternatives, and no new `PanResponder`,
JS-thread `Animated.event`, deprecated RNGH builders, or `InteractionManager`.

Navigation has shared transition exports in
`packages/ui/src/components/screenTransitions.ts`, but adoption needs to be
checked route by route. Modal and sheet presentation should remain Expo Router
native behavior where possible.

Priority:

- P0: verify cancellation, release, and accessibility behavior on the four
  highest-risk gesture surfaces.
- P1: establish one default navigation transition and one shared-element tier.
- P1: add pointer/keyboard alternatives on web for gesture-only actions.

### Accessibility and performance

Status: strong policy and partial implementation; uneven application.

Evidence:

- Visual capability and reduced-motion infrastructure exists in `packages/ui`.
- Shared controls often provide labels and reduced-motion behavior.
- Route shells and feature screens still mix raw controls, local sizing, and
  differing web/native semantics.
- The app already includes low-end/device/network capability logic and Firefly
  fallback guidance.

Priority:

- P0: preserve visible status and actions when animation, haptics, audio,
  artwork, or capability providers fail.
- P0: check primary touch targets and labels on the core journeys.
- P1: test constrained-device rendering for Skia, blur, particles, and list
  transitions.
- P1: add device evidence for reduced motion, Android low-end behavior, and
  web keyboard/focus alternatives.

### Device, network, power, and sensory constraints

The existing `RealityProvider` and `VisualCapabilities` are the correct
resolution boundary. Interaction features should consume resolved capabilities
instead of independently checking memory, battery, network, or reduced motion.

Boolean flags are insufficient for the experience layer. The resolver should
produce a multidimensional profile. A low-memory device, a low-battery device,
and a user who prefers reduced motion are different situations and should not
collapse into the same "off" result.

The proposed levels are:

| Channel | `off` | `essential` | `refined` | `rich` |
|---|---|---|---|---|
| Motion | static | pressed/state change | entrance/layout/gesture settle | ambient breath/drift/particles |
| Visual effects | flat fallback | light layering | blur/glow/texture selectively | full atmospheric scene |
| Haptics | none | meaningful success/error | selection and gesture boundaries | expressive rhythm only for guided moments |
| Sound | none | explicit guided cue | success/milestone cue | guided breath soundscape, opt-in only |
| Celebration | static status | checkmark | short glow | bounded particles/Firefly scene |

The profile should also carry numeric budgets such as maximum particles,
maximum concurrent sounds, asset prefetch permission, and animation duration
scale. A screen may request a level appropriate to its product meaning, but it
cannot exceed the resolved profile.

The first capability matrix is:

| Constraint | Full experience | Reduced experience | Essential fallback |
|---|---|---|---|
| High device / normal power | rich transitions and bounded atmosphere | refined | essential |
| Medium device | refined transitions, selective glow | essential | visible state and action |
| Battery saver | essential transitions, no ambient loop | essential/static | visible state and action |
| Low device | essential motion, no blur/particles/prefetch | static state | visible state and action |
| Poor/offline network | cached/local assets, no prefetch | same | procedural/SVG fallback |
| Reduced motion | no movement-based decoration | opacity/color/no-op | visible state and action |
| Quiet sensory preference | no sound; haptic only if explicitly allowed | no sound and minimal haptic | visible visual/status feedback |

The resolver applies constraints as caps, in order: hard platform/accessibility
constraints, device and power constraints, network constraints, user sensory
preferences, then screen-level requests. The policy must be monotonic: stronger
constraints may remove expensive layers, but may never remove the meaning,
control, label, or recovery action. Sound is
not a visual capability; it needs a parallel sensory preference and must also
respect app lifecycle, OS silent mode, interruption, and user opt-out.

## Layered implementation plan

### Layer 0 — contracts and instrumentation

- Freeze the semantic event vocabulary: press, selection, navigation, loading,
  queued/offline, success, recoverable error, milestone, and interruption.
- Confirm the installed dependency graph against `AGENTS.md` before any native
  dependency change. Do not run `expo install --check` or `expo install --fix`.
- Add or complete tests for shared primitives and failure boundaries.
- Record per-journey evidence for onboarding, Self, Workspace, Library,
  Community, and Profile.

### Layer 1 — shared interaction primitives

- Make `PressableScale`, `Collapse`, `useShake`, screen transitions, branded
  feedback states, and haptics the only shared seams for their concerns.
- Ensure every primitive has reduced-motion, disabled, interruption, and
  unmount behavior.
- Avoid introducing Moti or another animation engine.

### Layer 2 — tactile feedback system

- Introduce a typed semantic feedback boundary around the existing haptic
  helpers.
- Keep web as a safe no-op and make quiet/reduced-sensory preferences explicit.
- Add sound only after the event vocabulary and preference boundary exist.

### Layer 2b — sound design system

Sound should be designed as a small, quiet vocabulary rather than as a sound
for every interaction. The proposed first set is:

| Sound role | Product meaning | Initial treatment |
|---|---|---|
| `selection` | a choice changed | usually haptic only; sound off by default |
| `success` | a meaningful operation completed | short warm two-note motif |
| `milestone` | a real journey/reward moment | brighter, slightly longer resolution |
| `error` | an action needs correction | muted low, non-alarming cue or no sound |
| `breath-start` / `breath-end` | a guided practice boundary | soft air/wood tone, optional |
| `sync-restored` | queued work reached the server | brief confirmation, optional |

The implementation boundary should expose semantic events, not file names. A
sound service must:

- preload only small approved assets when capabilities and network allow;
- avoid downloading sounds on poor/offline connections;
- use local bundled assets for the first release;
- stop or duck when the app backgrounds, another audio session takes priority,
  or voice journaling starts;
- tolerate missing assets and playback errors without affecting the action;
- keep sound disabled for routine navigation and repeated list selection;
- expose a user preference with an explicit quiet mode;
- provide web no-op or browser-safe behavior without assuming autoplay;
- be tested for repeated events, unmount, interruption, and failure.

Sound art direction: intimate, organic, short, low-volume, and spacious—more
like a tiny lantern or wooden chime than a game reward, notification ping, or
continuous ambient soundtrack. Audio assets should be normalized, named by
semantic role, and reviewed on phone speakers and headphones before adoption.

### Layer 3 — route and gesture polish

- Apply the default transition to route groups consistently.
- Harden the workspace canvas, Self navigation, map/visualization, and
  attendance gestures with cancel/release and non-gesture alternatives.
- Add meaningful pressed, pending, success, error, and queued states to the
  core journeys.
- Resolve every effect through visual and sensory capability policies; do not
  add per-screen device heuristics.

### Layer 4 — Gurudevi signature moments

- Use Firefly/light-path feedback for orientation and recovery.
- Use breathing/drift/bloom only where the product meaning supports it.
- Keep ordinary operational surfaces calm and avoid ambient animation everywhere.
- Reserve sound for breath, meaningful completion, and milestone moments; never
  use it to compensate for unclear UI.

### Layer 5 — device validation and rollout

- Run targeted UI/package tests, type checks, lint, experience-contract checks,
  and anti-slop checks.
- Validate on a capable device and a low-end Android device.
- Verify reduced motion, screen reader labels, keyboard/pointer alternatives,
  silent/quiet sensory behavior, and failure fallbacks.
- Roll out by journey, with feature flags or reversible adoption where risk is
  material.

## Definition of done

- Every targeted state remains understandable without animation, haptics, or
  sound.
- Motion uses shared tokens and runs on the appropriate thread.
- Gestures have cancellation, release, accessibility, and platform alternatives.
- Haptics and sound are semantic, preference-aware, and failure-safe.
- Core journeys have device evidence, not only unit-test evidence.
- Documentation and generated stack maps are updated only through their owning
  workflows.

## Implementation status

Completed in the first foundation slice:

- Added `ExperienceLevel` and `ExperienceProfile` to the shared UI context.
- Added `resolveExperienceProfile()` with independent channel caps for motion,
  visual effects, haptics, sound, and celebration.
- Integrated the profile into `resolveVisualCapabilities()` while retaining the
  existing boolean fields for compatibility.
- Extended emergency visual safe mode to disable sensory sound and expensive
  experience layers.
- Added focused resolver tests and exposed the resolved levels/budgets in the
  development `VisualCapabilityInspector`.
- Added a dependency-light semantic feedback policy and controller in
  `packages/ui/src/utils/feedbackPolicy.ts`; it maps product events to graded
  haptic and injectable sound cues without coupling the shared package to Expo
  Audio.
- Added persisted sensory preferences (`hapticsEnabled`, `soundEnabled`, and
  `quietMode`) and connected them to the experience resolver.
- Added an Expo Audio sound-feedback boundary with tier-based concurrent-player
  limits and lifecycle cleanup in
  `apps/gurudevi-mobile/src/interaction/soundFeedback.tsx`.
- Added native/web settings controls for persisted haptics, sound, and quiet
  mode preferences in `AppSettingsScreen.shared.tsx`.
- Added a shared `FeedbackProvider` so product screens emit semantic events
  without coupling themselves to haptic or audio implementations; fidelity and
  sensory settings now use this path.
- Adopted semantic feedback in `packages/self/src/components/BreathGuide.tsx`
  for inhale, hold/rest, exhale, and completed-session moments.

Not yet implemented: the branded cue pack and systematic adoption across every
journey. The player skips missing cues and handles playback failures silently;
device validation is still required because audio session behavior cannot be
proven by TypeScript alone.

## Open audit items

- Complete final sub-agent reports and reconcile them with this document.
- Verify which current uncommitted UI files are already implementing the listed
  primitives before modifying them.
- Resolve the apparent mismatch between sacred versions in `AGENTS.md` and the
  currently declared mobile dependency versions through a dedicated dependency
  decision, not an interaction-polish change.
